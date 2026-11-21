import UIKit
import NitroModules

public class HybridNitroSafeArea: HybridNitroSafeAreaSpec {
  private let lock = NSLock()
  private var listeners: [UUID: (SafeAreaMetrics) -> Void] = [:]
  private var lastNotifiedMetrics: SafeAreaMetrics?
  private var pendingNotifyWorkItem: DispatchWorkItem?
  private var observers: [NSObjectProtocol] = []
  private var windowKvoTokens: [NSKeyValueObservation] = []
  private var tabBarKvoTokens: [NSKeyValueObservation] = []
  private var sidebarKvoTokens: [NSKeyValueObservation] = []
  private weak var observedWindow: UIWindow?
  private weak var observedTabBar: UITabBar?
  private weak var observedTabBarController: UITabBarController?

  public override init() {
    super.init()
    DispatchQueue.main.async { [weak self] in
      self?.setupObservers()
    }
  }

  deinit {
    observers.forEach { NotificationCenter.default.removeObserver($0) }
    observers.removeAll()
    windowKvoTokens.forEach { $0.invalidate() }
    windowKvoTokens.removeAll()
    tabBarKvoTokens.forEach { $0.invalidate() }
    tabBarKvoTokens.removeAll()
    sidebarKvoTokens.forEach { $0.invalidate() }
    sidebarKvoTokens.removeAll()
    lock.lock()
    pendingNotifyWorkItem?.cancel()
    pendingNotifyWorkItem = nil
    listeners.removeAll()
    lastNotifiedMetrics = nil
    lock.unlock()
  }

  // MARK: - Synchronous JSI API

  public func getSafeArea() throws -> SafeAreaMetrics {
    if Thread.isMainThread {
      return calculateMetrics()
    } else {
      return DispatchQueue.main.sync {
        return self.calculateMetrics()
      }
    }
  }

  public func addOnSafeAreaChangedListener(
    listener: @escaping (_ metrics: SafeAreaMetrics) -> Void
  ) throws -> () -> Void {
    let id = UUID()
    lock.lock()
    listeners[id] = listener
    lock.unlock()

    // Return unregister callback
    return { [weak self] in
      guard let self = self else { return }
      self.lock.lock()
      self.listeners.removeValue(forKey: id)
      self.lock.unlock()
    }
  }

  // MARK: - Metrics Calculation

  private func calculateMetrics() -> SafeAreaMetrics {
    guard let window = getKeyWindow() else {
      let isLandscape = UIScreen.main.bounds.width > UIScreen.main.bounds.height
      let orientation: DeviceOrientation = isLandscape ? .landscape : .portrait
      let empty = EdgeInsets(top: 0, left: 0, bottom: 0, right: 0)
      return SafeAreaMetrics(
        insets: empty,
        contentInsets: empty,
        mode: .none,
        tabBarHeight: 0,
        topCapsuleHeight: 0,
        sidebarWidth: 0,
        isTabBarHidden: false,
        orientation: orientation
      )
    }

    // Attach KVO if new window detected
    if observedWindow !== window {
      attachWindowKVO(window: window)
    }

    let windowInsets = window.safeAreaInsets
    let isPad = UIDevice.current.userInterfaceIdiom == .pad
    let screenBounds = window.bounds
    let isLandscape = screenBounds.width > screenBounds.height
    let orientation: DeviceOrientation = isLandscape ? .landscape : .portrait

    let rootVC = window.rootViewController
    let topVC = getTopViewController(from: rootVC)
    let tabBarController = findTabBarController(from: rootVC)

    var mode: NavigationMode = .none
    var tabBarHeight: Double = 0
    var topCapsuleHeight: Double = 0
    var sidebarWidth: Double = 0
    var isTabBarHidden = false

    var contentTop = Double(windowInsets.top)
    var contentBottom = Double(windowInsets.bottom)
    var contentLeft = Double(windowInsets.left)
    var contentRight = Double(windowInsets.right)

    if let tabVC = tabBarController {
      let tabBar = tabVC.tabBar
      isTabBarHidden = tabBar.isHidden

      if observedTabBarController !== tabVC {
        attachTabBarControllerKVO(tabVC: tabVC)
      }

      if !isPad {
        // iPhone: Bottom Tab Bar
        if !tabBar.isHidden {
          mode = .iphoneBottomTab
          tabBarHeight = Double(tabBar.frame.height)
          if tabBarHeight > 0 {
            contentBottom = max(Double(windowInsets.bottom), tabBarHeight)
          }
        }
      } else {
        // iPad: iPadOS 18+ Sidebar or Floating Top Capsule
        if #available(iOS 18.0, *) {
          if tabVC.sidebar.preferredLayout != .overlap {
            tabVC.sidebar.preferredLayout = .overlap
          }

          if !tabVC.sidebar.isHidden {
            // iPad Leftside Sidebar mode: sidebar overlays left ~320pt,
            // so contentLeft is set to sidebarWidth to push content out (pl-safe / px-safe)
            mode = .ipadLeftSidebar
            sidebarWidth = 320.0
            contentLeft = sidebarWidth
            contentTop = Double(windowInsets.top)
          } else {
            // iPad Floating Top Capsule mode (collapsed sidebar or standard tab mode)
            mode = .ipadTopCapsule
            let tabFrame = tabBar.frame
            if tabFrame.origin.y < screenBounds.height / 2 && tabFrame.height > 0 {
              topCapsuleHeight = Double(tabFrame.origin.y + tabFrame.height)
              contentTop = max(Double(windowInsets.top), topCapsuleHeight)
            } else if let viewInsets = topVC?.view.safeAreaInsets, viewInsets.top > windowInsets.top {
              topCapsuleHeight = Double(viewInsets.top)
              contentTop = topCapsuleHeight
            } else {
              topCapsuleHeight = Double(windowInsets.top) + 64.0
              contentTop = topCapsuleHeight
            }
          }
        } else {
          // Pre-iOS 18 iPad
          if !tabBar.isHidden {
            mode = .iphoneBottomTab
            tabBarHeight = Double(tabBar.frame.height)
            contentBottom = max(Double(windowInsets.bottom), tabBarHeight)
          }
        }

        // Cache last known iPad mode for zero-frame startup prediction
        let modeKey = (mode == .ipadTopCapsule) ? "ipad_top_capsule" : "ipad_left_sidebar"
        UserDefaults.standard.set(modeKey, forKey: "nitro_safe_area_last_pad_mode")
      }
    } else {
      // TabBarController not yet mounted in hierarchy (cold start Frame 0)
      if isPad {
        let lastModeString = UserDefaults.standard.string(forKey: "nitro_safe_area_last_pad_mode")
        if isLandscape {
          // On iPad Landscape, default to Leftside Sidebar (320pt) unless previously collapsed to capsule
          if lastModeString == "ipad_top_capsule" {
            mode = .ipadTopCapsule
            topCapsuleHeight = Double(windowInsets.top) + 64.0
            contentTop = topCapsuleHeight
          } else {
            mode = .ipadLeftSidebar
            sidebarWidth = 320.0
            contentLeft = sidebarWidth
            contentTop = Double(windowInsets.top)
          }
        } else {
          // On iPad Portrait, always top capsule
          mode = .ipadTopCapsule
          topCapsuleHeight = Double(windowInsets.top) + 64.0
          contentTop = topCapsuleHeight
        }
      }
    }

    // Cross-check with topVC.view.safeAreaInsets if available
    if let viewInsets = topVC?.view.safeAreaInsets {
      if mode == .iphoneBottomTab && Double(viewInsets.bottom) > contentBottom {
        contentBottom = Double(viewInsets.bottom)
      }
      if mode == .ipadTopCapsule && Double(viewInsets.top) > contentTop {
        contentTop = Double(viewInsets.top)
      }
      if mode == .ipadLeftSidebar && Double(viewInsets.left) > contentLeft {
        contentLeft = Double(viewInsets.left)
      }
    }

    let finalInsets = EdgeInsets(
      top: Double(windowInsets.top),
      left: Double(windowInsets.left),
      bottom: Double(windowInsets.bottom),
      right: Double(windowInsets.right)
    )

    let finalContentInsets = EdgeInsets(
      top: contentTop,
      left: contentLeft,
      bottom: contentBottom,
      right: contentRight
    )

    return SafeAreaMetrics(
      insets: finalInsets,
      contentInsets: finalContentInsets,
      mode: mode,
      tabBarHeight: tabBarHeight,
      topCapsuleHeight: topCapsuleHeight,
      sidebarWidth: sidebarWidth,
      isTabBarHidden: isTabBarHidden,
      orientation: orientation
    )
  }

  // MARK: - Observer & Notification Setup

  private func setupObservers() {
    let nc = NotificationCenter.default

    let orientationObserver = nc.addObserver(
      forName: UIDevice.orientationDidChangeNotification,
      object: nil,
      queue: .main
    ) { [weak self] _ in
      self?.notifyListeners()
    }
    observers.append(orientationObserver)

    let activeObserver = nc.addObserver(
      forName: UIApplication.didBecomeActiveNotification,
      object: nil,
      queue: .main
    ) { [weak self] _ in
      self?.notifyListeners()
    }
    observers.append(activeObserver)

    if let window = getKeyWindow() {
      attachWindowKVO(window: window)
    }
  }

  private func attachWindowKVO(window: UIWindow) {
    observedWindow = window
    windowKvoTokens.forEach { $0.invalidate() }
    windowKvoTokens.removeAll()

    let insetsToken = window.observe(\.safeAreaInsets, options: [.new]) { [weak self] _, _ in
      self?.notifyListeners()
    }
    let boundsToken = window.observe(\.bounds, options: [.new]) { [weak self] _, _ in
      self?.notifyListeners()
    }
    windowKvoTokens.append(contentsOf: [insetsToken, boundsToken])
  }

  private func attachTabBarControllerKVO(tabVC: UITabBarController) {
    observedTabBarController = tabVC
    attachTabBarKVO(tabBar: tabVC.tabBar)

    sidebarKvoTokens.forEach { $0.invalidate() }
    sidebarKvoTokens.removeAll()

    if #available(iOS 18.0, *) {
      tabVC.sidebar.preferredLayout = .overlap
      let sidebarHiddenToken = tabVC.sidebar.observe(\.isHidden, options: [.new]) { [weak self] _, _ in
        self?.notifyListeners()
      }
      sidebarKvoTokens.append(sidebarHiddenToken)

      let modeToken = tabVC.observe(\.mode, options: [.new]) { [weak self] _, _ in
        self?.notifyListeners()
      }
      sidebarKvoTokens.append(modeToken)
    }
  }

  private func attachTabBarKVO(tabBar: UITabBar) {
    observedTabBar = tabBar
    tabBarKvoTokens.forEach { $0.invalidate() }
    tabBarKvoTokens.removeAll()

    let hiddenToken = tabBar.observe(\.isHidden, options: [.new]) { [weak self] _, _ in
      self?.notifyListeners()
    }
    let frameToken = tabBar.observe(\.frame, options: [.new]) { [weak self] _, _ in
      self?.notifyListeners()
    }
    tabBarKvoTokens.append(contentsOf: [hiddenToken, frameToken])
  }

  private func metricsAreEqual(_ a: SafeAreaMetrics, _ b: SafeAreaMetrics) -> Bool {
    return a.insets.top == b.insets.top &&
           a.insets.left == b.insets.left &&
           a.insets.bottom == b.insets.bottom &&
           a.insets.right == b.insets.right &&
           a.contentInsets.top == b.contentInsets.top &&
           a.contentInsets.left == b.contentInsets.left &&
           a.contentInsets.bottom == b.contentInsets.bottom &&
           a.contentInsets.right == b.contentInsets.right &&
           a.mode == b.mode &&
           a.orientation == b.orientation &&
           a.isTabBarHidden == b.isTabBarHidden &&
           a.tabBarHeight == b.tabBarHeight &&
           a.topCapsuleHeight == b.topCapsuleHeight &&
           a.sidebarWidth == b.sidebarWidth
  }

  private func notifyListeners(debounce: Bool = true) {
    lock.lock()
    pendingNotifyWorkItem?.cancel()

    let workItem = DispatchWorkItem { [weak self] in
      self?.performNotifyListeners()
    }
    pendingNotifyWorkItem = workItem
    lock.unlock()

    if debounce {
      // Coalesces rapid sequential UIKit events during rotation:
      // (1) orientation change -> (2) window bounds resize -> (3) adaptive sidebar/capsule layout
      // into a single atomic update for JavaScript, preventing duplicate re-renders.
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.03, execute: workItem)
    } else {
      DispatchQueue.main.async(execute: workItem)
    }
  }

  private func performNotifyListeners() {
    lock.lock()
    let currentListeners = Array(listeners.values)
    lock.unlock()

    guard !currentListeners.isEmpty else { return }
    let metrics = calculateMetrics()

    lock.lock()
    if let last = lastNotifiedMetrics, metricsAreEqual(last, metrics) {
      lock.unlock()
      return
    }
    lastNotifiedMetrics = metrics
    lock.unlock()

    for listener in currentListeners {
      listener(metrics)
    }
  }

  // MARK: - View Hierarchy Helpers

  private func getKeyWindow() -> UIWindow? {
    if #available(iOS 13.0, *) {
      for scene in UIApplication.shared.connectedScenes {
        guard let windowScene = scene as? UIWindowScene else { continue }
        for window in windowScene.windows {
          if window.isKeyWindow {
            return window
          }
        }
      }
      for scene in UIApplication.shared.connectedScenes {
        guard let windowScene = scene as? UIWindowScene else { continue }
        if let window = windowScene.windows.first {
          return window
        }
      }
    }
    return UIApplication.shared.keyWindow
  }

  private func getTopViewController(from root: UIViewController?) -> UIViewController? {
    guard let root = root else { return nil }
    if let presented = root.presentedViewController {
      return getTopViewController(from: presented)
    }
    if let nav = root as? UINavigationController {
      return getTopViewController(from: nav.visibleViewController ?? nav.topViewController)
    }
    if let tab = root as? UITabBarController {
      return getTopViewController(from: tab.selectedViewController)
    }
    for child in root.children {
      if let top = getTopViewController(from: child) {
        return top
      }
    }
    return root
  }

  private func findTabBarController(from root: UIViewController?) -> UITabBarController? {
    guard let root = root else { return nil }
    if let tab = root as? UITabBarController {
      return tab
    }
    if let nav = root as? UINavigationController {
      if let tab = findTabBarController(from: nav.visibleViewController ?? nav.topViewController) {
        return tab
      }
    }
    if let presented = root.presentedViewController {
      if let tab = findTabBarController(from: presented) {
        return tab
      }
    }
    for child in root.children {
      if let tab = findTabBarController(from: child) {
        return tab
      }
    }
    return nil
  }
}
