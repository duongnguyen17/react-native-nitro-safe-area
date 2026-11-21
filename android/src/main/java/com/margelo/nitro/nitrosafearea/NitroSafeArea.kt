package com.margelo.nitro.nitrosafearea

import android.app.Activity
import android.content.ComponentCallbacks2
import android.content.res.Configuration
import android.content.res.Resources
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.ViewGroup
import android.view.ViewTreeObserver
import android.view.WindowManager
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext
import java.lang.ref.WeakReference
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

@DoNotStrip
class HybridNitroSafeArea : HybridNitroSafeAreaSpec() {
  private val listeners = ConcurrentHashMap<String, (SafeAreaMetrics) -> Unit>()
  @Volatile private var lastNotifiedMetrics: SafeAreaMetrics? = null
  private var layoutListener: ViewTreeObserver.OnGlobalLayoutListener? = null
  private var preDrawListener: ViewTreeObserver.OnPreDrawListener? = null
  private var lastObservedInsets: WindowInsetsCompat? = null
  @Volatile private var lastBottomNavOffscreen: Boolean? = null
  @Volatile private var attachedDecorView: View? = null
  private var componentCallbacks: ComponentCallbacks2? = null
  private var registeredActivity: WeakReference<Activity>? = null
  private var lifecycleListener: LifecycleEventListener? = null
  @Volatile private var cachedBottomNavRef: WeakReference<View>? = null
  private val mainHandler = Handler(Looper.getMainLooper())
  private var pendingNotifyRunnable: Runnable? = null
  private val lock = Any()

  init {
    synchronized(lock) {
      instance?.cleanup()
      instance = this
    }
    ensureInitialized()
  }

  override fun getSafeArea(): SafeAreaMetrics {
    val metrics = calculateMetrics()
    synchronized(lock) {
      if (lastNotifiedMetrics == null) {
        lastNotifiedMetrics = metrics
      }
    }
    return metrics
  }

  override fun addOnSafeAreaChangedListener(
    listener: (metrics: SafeAreaMetrics) -> Unit
  ): () -> Unit {
    val id = UUID.randomUUID().toString()
    listeners[id] = listener
    ensureInitialized()

    return {
      listeners.remove(id)
    }
  }

  internal fun ensureInitialized() {
    val context = getContext() ?: return
    val activity = context.currentActivity
    if (activity != null) {
      setupListeners(activity)
    }

    if (lifecycleListener == null) {
      val listener = object : LifecycleEventListener {
        override fun onHostResume() {
          context.currentActivity?.let { act ->
            setupListeners(act)
            scheduleNotify()
          }
        }
        override fun onHostPause() {}
        override fun onHostDestroy() {
          cleanupListeners()
        }
      }
      lifecycleListener = listener
      context.addLifecycleEventListener(listener)
    }
  }

  private fun setupListeners(activity: Activity) {
    activity.runOnUiThread {
      val window = activity.window ?: return@runOnUiThread
      val decorView = window.decorView

      if (attachedDecorView === decorView && layoutListener != null) {
        return@runOnUiThread
      }

      // Clean up previous view listener if attached to a different view / activity
      cleanupListeners()

      attachedDecorView = decorView
      // Discover bottom nav initially when view attaches
      findBottomNavigationView(decorView)

      val listener = ViewTreeObserver.OnGlobalLayoutListener {
        scheduleNotify()
      }
      layoutListener = listener
      decorView.viewTreeObserver.addOnGlobalLayoutListener(listener)

      // Listen for window insets and bottom tab slide animations non-invasively via OnPreDrawListener
      // Catches status bar / navigation bar visibility toggles, keyboard shifts, and scroll-to-hide tabs
      // Zero view-tree traversal on pre-draw: only inspects cached view instance if present (O(1))
      val preDraw = ViewTreeObserver.OnPreDrawListener {
        var changed = false
        val currentInsets = ViewCompat.getRootWindowInsets(decorView)
        if (currentInsets != null && currentInsets != lastObservedInsets) {
          lastObservedInsets = currentInsets
          changed = true
        }

        // Fast path: inspect only the already-cached bottom nav view (0 DFS traversal)
        val bottomNav = cachedBottomNavRef?.get()
        if (bottomNav != null && bottomNav.isAttachedToWindow) {
          val isOffscreen = bottomNav.visibility != View.VISIBLE ||
                            bottomNav.height == 0 ||
                            bottomNav.translationY >= (bottomNav.height * 0.5f)
          if (isOffscreen != lastBottomNavOffscreen) {
            lastBottomNavOffscreen = isOffscreen
            changed = true
          }
        } else if (lastBottomNavOffscreen != null) {
          lastBottomNavOffscreen = null
          changed = true
        }

        if (changed) {
          scheduleNotify()
        }
        true
      }
      preDrawListener = preDraw
      decorView.viewTreeObserver.addOnPreDrawListener(preDraw)

      // Listen for configuration (orientation) changes
      val callbacks = object : ComponentCallbacks2 {
        override fun onConfigurationChanged(newConfig: Configuration) {
          scheduleNotify()
        }
        override fun onLowMemory() {}
        override fun onTrimMemory(level: Int) {}
      }
      componentCallbacks = callbacks
      registeredActivity = WeakReference(activity)
      activity.registerComponentCallbacks(callbacks)

      scheduleNotify()
    }
  }

  private fun cleanupListeners() {
    // 1. Remove DecorView layout and pre-draw listeners
    attachedDecorView?.let { oldView ->
      if (oldView.viewTreeObserver.isAlive) {
        layoutListener?.let { oldListener ->
          oldView.viewTreeObserver.removeOnGlobalLayoutListener(oldListener)
        }
        preDrawListener?.let { oldPreDraw ->
          oldView.viewTreeObserver.removeOnPreDrawListener(oldPreDraw)
        }
      }
    }
    attachedDecorView = null
    layoutListener = null
    preDrawListener = null
    lastObservedInsets = null
    lastBottomNavOffscreen = null

    // 2. Unregister ComponentCallbacks2 from registered activity
    registeredActivity?.get()?.let { act ->
      componentCallbacks?.let { callbacks ->
        try {
          act.unregisterComponentCallbacks(callbacks)
        } catch (_: Throwable) {}
      }
    }
    registeredActivity = null
    componentCallbacks = null
    cachedBottomNavRef = null
  }

  fun cleanup() {
    synchronized(lock) {
      pendingNotifyRunnable?.let { mainHandler.removeCallbacks(it) }
      pendingNotifyRunnable = null
      cleanupListeners()
      lifecycleListener?.let { listener ->
        getContext()?.removeLifecycleEventListener(listener)
        lifecycleListener = null
      }
    }
  }

  private fun isBottomNavClass(clazz: Class<*>): Boolean {
    val simple = clazz.simpleName
    val full = clazz.name
    return simple == "BottomNavigationView" ||
           simple == "NavigationBarView" ||
           full.endsWith(".BottomNavigationView") ||
           full.endsWith(".NavigationBarView")
  }

  private fun findBottomNavigationView(view: View?): View? {
    if (view == null) return null

    // Fast path: reuse cached instance if still attached to window
    cachedBottomNavRef?.get()?.let { cached ->
      if (cached.isAttachedToWindow && isBottomNavClass(cached.javaClass)) {
        return cached
      }
    }

    val found = searchBottomNavDFS(view)
    if (found != null) {
      cachedBottomNavRef = WeakReference(found)
    }
    return found
  }

  private fun searchBottomNavDFS(view: View?): View? {
    if (view == null) return null
    var currentClass: Class<*>? = view.javaClass
    while (currentClass != null && currentClass != Any::class.java) {
      if (isBottomNavClass(currentClass)) {
        return view
      }
      currentClass = currentClass.superclass
    }
    if (view is ViewGroup) {
      for (i in 0 until view.childCount) {
        val found = searchBottomNavDFS(view.getChildAt(i))
        if (found != null) return found
      }
    }
    return null
  }

  private fun calculateMetrics(): SafeAreaMetrics {
    val context = getContext()
    val activity = context?.currentActivity
    val window = activity?.window
    val decorView = window?.decorView ?: attachedDecorView

    val density = decorView?.resources?.displayMetrics?.density
      ?: context?.resources?.displayMetrics?.density
      ?: Resources.getSystem().displayMetrics.density

    var topDp = 0.0
    var bottomDp = 0.0
    var leftDp = 0.0
    var rightDp = 0.0

    var hasWindowInsets = false
    if (decorView != null) {
      val windowInsets = ViewCompat.getRootWindowInsets(decorView)
        ?: (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
          decorView.rootWindowInsets?.let { WindowInsetsCompat.toWindowInsetsCompat(it, decorView) }
        } else null)

      if (windowInsets != null) {
        hasWindowInsets = true
        val systemBarsInsets = windowInsets.getInsets(
          WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout()
        )
        val cutout = windowInsets.displayCutout
        val cutoutLeft = cutout?.safeInsetLeft ?: 0
        val cutoutTop = cutout?.safeInsetTop ?: 0
        val cutoutRight = cutout?.safeInsetRight ?: 0
        val cutoutBottom = cutout?.safeInsetBottom ?: 0

        val leftPx = maxOf(systemBarsInsets.left, cutoutLeft)
        val topPx = maxOf(systemBarsInsets.top, cutoutTop)
        val rightPx = maxOf(systemBarsInsets.right, cutoutRight)
        val bottomPx = maxOf(systemBarsInsets.bottom, cutoutBottom)

        topDp = (topPx / density).toDouble()
        bottomDp = (bottomPx / density).toDouble()
        leftDp = (leftPx / density).toDouble()
        rightDp = (rightPx / density).toDouble()
      }
    }

    // Accurate orientation check from activity/window configuration
    val config = activity?.resources?.configuration
      ?: context?.resources?.configuration
      ?: decorView?.resources?.configuration
      ?: Resources.getSystem().configuration

    val isLandscape = config.orientation == Configuration.ORIENTATION_LANDSCAPE
    val orientation = if (isLandscape) DeviceOrientation.LANDSCAPE else DeviceOrientation.PORTRAIT

    // Fallback for top status bar ONLY when WindowInsets are not yet attached on cold launch
    if (!hasWindowInsets && !isLandscape) {
      val res = activity?.resources ?: context?.resources ?: Resources.getSystem()
      val statusBarResId = res.getIdentifier("status_bar_height", "dimen", "android")
      if (statusBarResId > 0) {
        topDp = (res.getDimensionPixelSize(statusBarResId) / density).toDouble()
      } else {
        topDp = 24.0
      }
    }

    // Detect Native Bottom Navigation View (BottomNavigationView / NavigationBarView)
    var tabBarHeightDp = 0.0
    var mode = NavigationMode.NONE
    var isTabBarHidden = false

    if (decorView != null) {
      val bottomNav = findBottomNavigationView(decorView)
      if (bottomNav != null) {
        val isVisible = bottomNav.visibility == View.VISIBLE
        // Account for animated / scroll-to-hide tabs (translationY pushes view offscreen)
        val isOffscreen = bottomNav.translationY >= (bottomNav.height * 0.5f)
        if (isVisible && bottomNav.height > 0 && !isOffscreen) {
          tabBarHeightDp = (bottomNav.height / density).toDouble()
          mode = NavigationMode.IPHONE_BOTTOM_TAB
          isTabBarHidden = false
        } else {
          isTabBarHidden = true
        }
      }
    }

    // When Native Bottom Tab is active, content insets bottom includes the Bottom Tab height
    val contentBottomDp = if (mode == NavigationMode.IPHONE_BOTTOM_TAB) {
      maxOf(bottomDp, tabBarHeightDp)
    } else {
      bottomDp
    }

    val insets = EdgeInsets(top = topDp, left = leftDp, bottom = bottomDp, right = rightDp)
    val contentInsets = EdgeInsets(top = topDp, left = leftDp, bottom = contentBottomDp, right = rightDp)

    return SafeAreaMetrics(
      insets = insets,
      contentInsets = contentInsets,
      mode = mode,
      tabBarHeight = tabBarHeightDp,
      topCapsuleHeight = 0.0,
      sidebarWidth = 0.0,
      isTabBarHidden = isTabBarHidden,
      orientation = orientation
    )
  }

  private fun scheduleNotify() {
    synchronized(lock) {
      pendingNotifyRunnable?.let { mainHandler.removeCallbacks(it) }
      val runnable = Runnable {
        notifyListeners()
      }
      pendingNotifyRunnable = runnable
      mainHandler.postDelayed(runnable, 30) // 30ms coalesce
    }
  }

  private fun notifyListeners() {
    if (listeners.isEmpty()) return
    val metrics = calculateMetrics()

    synchronized(lock) {
      if (lastNotifiedMetrics == metrics) {
        return
      }
      lastNotifiedMetrics = metrics
    }

    for (listener in listeners.values) {
      listener(metrics)
    }
  }

  companion object {
    @Volatile
    var reactContext: ReactApplicationContext? = null

    fun setContext(context: ReactApplicationContext) {
      reactContext = context
      instance?.ensureInitialized()
    }

    @Volatile
    internal var instance: HybridNitroSafeArea? = null

    fun getContext(): ReactApplicationContext? {
      return reactContext ?: try {
        com.margelo.nitro.NitroModules.applicationContext
      } catch (_: Throwable) {
        null
      }
    }
  }
}
