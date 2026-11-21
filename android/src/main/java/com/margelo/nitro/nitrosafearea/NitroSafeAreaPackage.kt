package com.margelo.nitro.nitrosafearea

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class NitroSafeAreaPackage : ReactPackage {
  @Suppress("DEPRECATION")
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    HybridNitroSafeArea.setContext(reactContext)
    return emptyList()
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return emptyList()
  }

  companion object {
    init {
      System.loadLibrary("nitrosafearea")
    }
  }
}
