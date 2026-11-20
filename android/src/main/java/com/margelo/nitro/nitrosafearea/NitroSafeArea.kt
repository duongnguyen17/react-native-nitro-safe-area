package com.margelo.nitro.nitrosafearea

import android.content.res.Configuration
import android.content.res.Resources
import android.os.Build
import android.view.View
import android.view.ViewTreeObserver
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.bridge.ReactApplicationContext
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

@DoNotStrip
class HybridNitroSafeArea : HybridNitroSafeAreaSpec() {
  private val listeners = ConcurrentHashMap<String, (SafeAreaMetrics) -> Unit>()
  private var layoutListener: ViewTreeObserver.OnGlobalLayoutListener? = null
  private var attachedDecorView: View? = null

  init {
    setupGlobalLayoutListener()
  }

  override fun getSafeArea(): SafeAreaMetrics {
    return calculateMetrics()
  }

  override fun addOnSafeAreaChangedListener(
    listener: (metrics: SafeAreaMetrics) -> Unit
  ): () -> Unit {
    val id = UUID.randomUUID().toString()
    listeners[id] = listener
    setupGlobalLayoutListener()

    return {
      listeners.remove(id)
    }
  }

  private fun calculateMetrics(): SafeAreaMetrics {
    val activity = reactContext?.currentActivity
    val decorView = activity?.window?.decorView
    val density = decorView?.resources?.displayMetrics?.density
      ?: Resources.getSystem().displayMetrics.density

    var topDp = 0.0
    var bottomDp = 0.0
    var leftDp = 0.0
    var rightDp = 0.0

    if (decorView != null) {
      val windowInsets = ViewCompat.getRootWindowInsets(decorView)
      if (windowInsets != null) {
        val systemBars = windowInsets.getInsets(
          WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout()
        )
        topDp = (systemBars.top / density).toDouble()
        bottomDp = (systemBars.bottom / density).toDouble()
        leftDp = (systemBars.left / density).toDouble()
        rightDp = (systemBars.right / density).toDouble()
      }
    }

    // Fallback if decorView insets not yet ready
    if (topDp == 0.0) {
      val res = decorView?.resources ?: Resources.getSystem()
      val statusBarResId = res.getIdentifier("status_bar_height", "dimen", "android")
      if (statusBarResId > 0) {
        topDp = (res.getDimensionPixelSize(statusBarResId) / density).toDouble()
      } else {
        topDp = 24.0
      }
    }

    val res = decorView?.resources ?: Resources.getSystem()
    val isLandscape = res.configuration.orientation == Configuration.ORIENTATION_LANDSCAPE
    val orientation = if (isLandscape) DeviceOrientation.LANDSCAPE else DeviceOrientation.PORTRAIT

    val insets = EdgeInsets(top = topDp, left = leftDp, bottom = bottomDp, right = rightDp)

    return SafeAreaMetrics(
      insets = insets,
      contentInsets = insets,
      mode = NavigationMode.NONE,
      tabBarHeight = 0.0,
      topCapsuleHeight = 0.0,
      sidebarWidth = 0.0,
      isTabBarHidden = false,
      orientation = orientation
    )
  }

  private fun setupGlobalLayoutListener() {
    val activity = reactContext?.currentActivity ?: return
    val decorView = activity.window?.decorView ?: return

    if (attachedDecorView === decorView && layoutListener != null) {
      return
    }

    activity.runOnUiThread {
      attachedDecorView = decorView
      layoutListener = ViewTreeObserver.OnGlobalLayoutListener {
        notifyListeners()
      }
      decorView.viewTreeObserver.addOnGlobalLayoutListener(layoutListener)
    }
  }

  private fun notifyListeners() {
    if (listeners.isEmpty()) return
    val metrics = calculateMetrics()
    for (listener in listeners.values) {
      listener(metrics)
    }
  }

  companion object {
    var reactContext: ReactApplicationContext? = null
  }
}
