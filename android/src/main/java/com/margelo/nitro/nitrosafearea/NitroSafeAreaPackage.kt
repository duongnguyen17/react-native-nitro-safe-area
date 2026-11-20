package com.margelo.nitro.nitrosafearea

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfoProvider

class NitroSafeAreaPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    NitroSafeArea.reactContext = reactContext
    return null
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider { emptyMap() }
  }

  companion object {
    init {
      System.loadLibrary("nitrosafearea")
    }
  }
}
