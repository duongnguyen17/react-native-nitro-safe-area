import UIKit
import NitroModules

public class NitroSafeArea: HybridNitroSafeAreaSpec {
  private var listeners: [UUID: (SafeAreaMetrics) -> Void] = [:]
  private var observers: [NSObjectProtocol] = []
  private var kvoTokens: [NSKeyValueObservation] = []
  private weak var observedWindow: UIWindow?
  private weak var observedTabBar: UITabBar?

  public override init() {
    super.init()
    DispatchQueue.main.async { [weak self] in
      self?.setupObservers()
    }
  }

  deinit {
    observers.forEach { NotificationCenter.default.removeObserver($0) }
    observers.removeAll()
    kvoTokens.forEach { $0.invalidate() }
    kvoTokens.removeAll()
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
    listeners[id] = listener

    // Return unregister callback
    return { [weak self] in
      self?.listeners.removeValue(forKey: id)
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

      if observedTabBar !== tabBar {
        attachTabBarKVO(tabBar: tabBar)
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
          if tabVC.mode == .tabSidebar && tabVC.sidebar.isPresented {
            // iPad Leftside Sidebar mode
            mode = .ipadLeftSidebar
            if let viewInsets = topVC?.view.safeAreaInsets, viewInsets.left > windowInsets.left {
              sidebarWidth = Double(viewInsets.left)
              contentLeft = sidebarWidth
            } else {
              sidebarWidth = 320.0
              contentLeft = sidebarWidth
            }
          } else {
            // iPad Floating Top Capsule mode (collapsed sidebar or standard tab mode)
            if !tabBar.isHidden {
              mode = .ipadTopCapsule
              let tabFrame = tabBar.frame
              if tabFrame.origin.y < screenBounds.height / 2 && tabFrame.height > 0 {
                topCapsuleHeight = Double(tabFrame.origin.y + tabFrame.height)
                contentTop = max(Double(windowInsets.top), topCapsuleHeight)
              } else if let viewInsets = topVC?.view.safeAreaInsets, viewInsets.top > windowInsets.top {
                topCapsuleHeight = Double(viewInsets.top)
                contentTop = topCapsuleHeight
              } else {
                topCapsuleHeight = Double(windowInsets.top) + 50.0
                contentTop = topCapsuleHeight
              }
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
    kvoTokens.forEach { $0.invalidate() }
    kvoTokens.removeAll()

    let insetsToken = window.observe(\.safeAreaInsets, options: [.new]) { [weak self] _, _ in
      self?.notifyListeners()
    }
    let boundsToken = window.observe(\.bounds, options: [.new]) { [weak self] _, _ in
      self?.notifyListeners()
    }
    kvoTokens.append(contentsOf: [insetsToken, boundsToken])
  }

  private func attachTabBarKVO(tabBar: UITabBar) {
    observedTabBar = tabBar
    let hiddenToken = tabBar.observe(\.isHidden, options: [.new]) { [weak self] _, _ in
      self?.notifyListeners()
    }
    let frameToken = tabBar.observe(\.frame, options: [.new]) { [weak self] _, _ in
      self?.notifyListeners()
    }
    kvoTokens.append(contentsOf: [hiddenToken, frameToken])
  }

  private func notifyListeners() {
    guard !listeners.isEmpty else { return }
    let metrics = calculateMetrics()
    for listener in listeners.values {
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
