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
  private var isAdaptiveNavigationEnabled: Bool = false

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

  public func setAdaptiveNavigationEnabled(enabled: Bool) throws {
    lock.lock()
    let changed = isAdaptiveNavigationEnabled != enabled
    isAdaptiveNavigationEnabled = enabled
    lock.unlock()
    if changed {
      if Thread.isMainThread {
        notifyListeners(debounce: false)
      } else {
        DispatchQueue.main.async { [weak self] in
          self?.notifyListeners(debounce: false)
        }
      }
    }
  }

  // MARK: - Metrics Calculation

  private func calculateMetrics() -> SafeAreaMetrics {
    #if DEBUG
    dispatchPrecondition(condition: .onQueue(.main))
    #endif

    guard let window = getKeyWindow() else {
      var screenBounds: CGRect = .zero
      if #available(iOS 13.0, *) {
        for scene in UIApplication.shared.connectedScenes {
          if let windowScene = scene as? UIWindowScene {
            screenBounds = windowScene.screen.bounds
            break
          }
        }
      }
      if screenBounds == .zero {
        screenBounds = UIScreen.main.bounds
      }
      let isLandscape = screenBounds.width > screenBounds.height
      let isPad = UIDevice.current.userInterfaceIdiom == .pad
      let orientation: DeviceOrientation = isLandscape ? .landscape : .portrait
      var initialContentInsets = EdgeInsets(top: 0, left: 0, bottom: 0, right: 0)
      var fallbackMode: NavigationMode = .none
      var fallbackSidebarWidth: Double = 0.0
      var fallbackTopCapsuleHeight: Double = 0.0

      if isAdaptiveNavigationEnabled && UIDevice.current.userInterfaceIdiom == .pad {
        if #available(iOS 18.0, *) {
          if orientation == .landscape {
            fallbackMode = .ipadLeftSidebar
            fallbackSidebarWidth = 320.0
            initialContentInsets = EdgeInsets(top: 0, left: 320.0, bottom: 0, right: 0)
          } else {
            fallbackMode = .ipadTopCapsule
            fallbackTopCapsuleHeight = 88.0
            initialContentInsets = EdgeInsets(top: 88.0, left: 0, bottom: 0, right: 0)
          }
        }
      }

      let defaultNavBarHeight: Double = getIntrinsicNavBarHeight(screenBounds: screenBounds)
      let largeTitleNavBarHeight: Double = defaultNavBarHeight + 52.0
      let intrinsicTopOffset: Double = {
        if initialContentInsets.top > 0 {
          return initialContentInsets.top
        }
        if !isPad && isLandscape && defaultNavBarHeight >= 50.0 {
          return 24.0
        }
        return initialContentInsets.top
      }()
      let headerHeight: Double = intrinsicTopOffset + defaultNavBarHeight

      let initialFrame = Rect(x: 0, y: 0, width: Double(screenBounds.width), height: Double(screenBounds.height))
      return SafeAreaMetrics(
        insets: EdgeInsets(top: 0, left: 0, bottom: 0, right: 0),
        contentInsets: initialContentInsets,
        mode: fallbackMode,
        tabBarHeight: 0,
        topCapsuleHeight: fallbackTopCapsuleHeight,
        sidebarWidth: fallbackSidebarWidth,
        isTabBarHidden: false,
        orientation: orientation,
        frame: initialFrame,
        navBarHeight: defaultNavBarHeight,
        headerHeight: headerHeight,
        largeTitleNavBarHeight: largeTitleNavBarHeight
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
      let isModalPresentedOverTabs: Bool = {
        guard let top = topVC else { return false }
        var current: UIViewController? = top
        while let c = current {
          if c === tabVC { return false }
          current = c.parent
        }
        return top.presentingViewController != nil || rootVC?.presentedViewController != nil
      }()

      if !isModalPresentedOverTabs {
        let tabBar = tabVC.tabBar
        isTabBarHidden = tabBar.isHidden || tabBar.alpha <= 0.01

        if observedTabBarController !== tabVC {
          attachTabBarControllerKVO(tabVC: tabVC)
        }

      if !isPad {
        // iPhone: Bottom Tab Bar
        if !isTabBarHidden {
          mode = .iphoneBottomTab
          tabBarHeight = Double(tabBar.frame.height)
          if tabBarHeight > 0 {
            contentBottom = max(Double(windowInsets.bottom), tabBarHeight)
          }
        }
      } else {
        // iPad: iPadOS 18+ Sidebar or Floating Top Capsule
        if #available(iOS 18.0, *) {
          if !tabVC.sidebar.isHidden {
            var measuredWidth: Double = 320.0
            if let sidebarView = tabVC.view.subviews.first(where: {
              String(describing: type(of: $0)).contains("Sidebar")
            }), sidebarView.frame.width > 0 {
              measuredWidth = Double(sidebarView.frame.width)
            }

            // Check if sidebar overlaps content:
            // - preferredLayout == .overlap: explicitly overlays content
            // - preferredLayout == .automatic: overlay if content view starts at x == 0 under the sidebar
            let isOverlapping: Bool
            if tabVC.sidebar.preferredLayout == .overlap {
              isOverlapping = true
            } else if tabVC.sidebar.preferredLayout == .tile {
              isOverlapping = false
            } else {
              if let contentView = tabVC.selectedViewController?.view ?? topVC?.view {
                isOverlapping = contentView.frame.origin.x < 10.0
              } else {
                isOverlapping = false
              }
            }

            if isOverlapping {
              mode = .ipadLeftSidebar
              sidebarWidth = measuredWidth
              contentLeft = sidebarWidth
              contentTop = Double(windowInsets.top)
            } else {
              // Tiled layout: UIKit positions content view alongside sidebar, so content does not overlap
              mode = .none
              sidebarWidth = 0.0
            }
          } else if !isTabBarHidden {
            // iPad Floating Top Capsule mode (collapsed sidebar or standard tab mode)
            let tabFrame = tabBar.frame
            if tabFrame.origin.y < screenBounds.height / 2 && tabFrame.height > 0 {
              mode = .ipadTopCapsule
              topCapsuleHeight = Double(tabFrame.origin.y + tabFrame.height)
              contentTop = max(Double(windowInsets.top), topCapsuleHeight)
            } else if let viewInsets = topVC?.view.safeAreaInsets, viewInsets.top > windowInsets.top {
              mode = .ipadTopCapsule
              topCapsuleHeight = Double(viewInsets.top)
              contentTop = topCapsuleHeight
            } else {
              // Standard bottom tab bar on iPad
              mode = .iphoneBottomTab
              tabBarHeight = Double(tabBar.frame.height)
              contentBottom = max(Double(windowInsets.bottom), tabBarHeight)
            }
          }
        } else {
          // Pre-iOS 18 iPad
          if !isTabBarHidden {
            mode = .iphoneBottomTab
            tabBarHeight = Double(tabBar.frame.height)
            contentBottom = max(Double(windowInsets.bottom), tabBarHeight)
          }
        }
      }
      }
    }

    if mode == .none && isAdaptiveNavigationEnabled && isPad && tabBarController == nil {
      if #available(iOS 18.0, *) {
        if orientation == .landscape {
          mode = .ipadLeftSidebar
          sidebarWidth = 320.0
          contentLeft = max(contentLeft, sidebarWidth)
          contentTop = Double(windowInsets.top)
        } else {
          mode = .ipadTopCapsule
          topCapsuleHeight = Double(windowInsets.top) + 64.0
          contentTop = max(contentTop, topCapsuleHeight)
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

    let finalFrame = Rect(
      x: 0,
      y: 0,
      width: Double(screenBounds.width),
      height: Double(screenBounds.height)
    )

    // Navigation bar height calculation (0ms Frame 0 engine)
    var navBarHeight: Double = getIntrinsicNavBarHeight(screenBounds: screenBounds)

    // Intrinsic top offset for header (Frame 0):
    // - In portrait: navigation bar starts below status bar / dynamic island (windowInsets.top).
    // - In landscape on iPhone with modern liquid glass bars (iOS 26+): status bar is hidden (windowInsets.top == 0),
    //   but UIKit sets _minimumTopPadding to 24pt to clear rounded corner curvature and bezel.
    let intrinsicTopOffset: Double = {
      if Double(windowInsets.top) > 0 {
        return Double(windowInsets.top)
      }
      if !isPad && isLandscape && navBarHeight >= 50.0 {
        return 24.0
      }
      return Double(windowInsets.top)
    }()

    var headerHeight: Double = intrinsicTopOffset + navBarHeight

    if let nav = topVC?.navigationController ?? findNavigationController(from: rootVC) {
      let bar = nav.navigationBar
      let barHeight = Double(bar.frame.height)
      if barHeight > 0 {
        navBarHeight = barHeight
      }

      // If navigation bar is active and laid out in window
      if !nav.isNavigationBarHidden && !bar.isHidden && bar.alpha > 0.01 {
        let barInWindow = bar.convert(bar.bounds, to: window)
        if barInWindow.maxY > 0 {
          headerHeight = Double(barInWindow.maxY)
        }
      } else if let topView = topVC?.view, topView.safeAreaInsets.top > 0 {
        let vcTopInset = Double(topView.safeAreaInsets.top)
        if vcTopInset >= navBarHeight {
          headerHeight = vcTopInset
        }
      }
    }

    let largeTitleNavBarHeight: Double = navBarHeight + 52.0

    return SafeAreaMetrics(
      insets: finalInsets,
      contentInsets: finalContentInsets,
      mode: mode,
      tabBarHeight: tabBarHeight,
      topCapsuleHeight: topCapsuleHeight,
      sidebarWidth: sidebarWidth,
      isTabBarHidden: isTabBarHidden,
      orientation: orientation,
      frame: finalFrame,
      navBarHeight: navBarHeight,
      headerHeight: headerHeight,
      largeTitleNavBarHeight: largeTitleNavBarHeight
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
    let alphaToken = tabBar.observe(\.alpha, options: [.new]) { [weak self] _, _ in
      self?.notifyListeners()
    }
    tabBarKvoTokens.append(contentsOf: [hiddenToken, frameToken, alphaToken])
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
           a.sidebarWidth == b.sidebarWidth &&
           a.navBarHeight == b.navBarHeight &&
           a.headerHeight == b.headerHeight &&
           a.largeTitleNavBarHeight == b.largeTitleNavBarHeight
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

  private func findNavigationController(from root: UIViewController?) -> UINavigationController? {
    guard let root = root else { return nil }
    if let nav = root as? UINavigationController {
      return nav
    }
    if let presented = root.presentedViewController {
      if let nav = findNavigationController(from: presented) {
        return nav
      }
    }
    if let tab = root as? UITabBarController {
      if let nav = findNavigationController(from: tab.selectedViewController) {
        return nav
      }
    }
    for child in root.children {
      if let nav = findNavigationController(from: child) {
        return nav
      }
    }
    return nil
  }

  private func getIntrinsicNavBarHeight(screenBounds: CGRect) -> Double {
    let bar = UINavigationBar()
    let measured = Double(bar.sizeThatFits(CGSize(width: screenBounds.width, height: 0)).height)
    if measured > 0 {
      return measured
    }
    let isPad = UIDevice.current.userInterfaceIdiom == .pad
    let isLandscape = screenBounds.width > screenBounds.height
    return isPad ? 50.0 : (isLandscape ? 32.0 : 44.0)
  }
}
