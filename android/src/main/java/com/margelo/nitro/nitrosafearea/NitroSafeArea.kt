package com.margelo.nitro.nitrosafearea
  
import com.facebook.proguard.annotations.DoNotStrip

@DoNotStrip
class NitroSafeArea : HybridNitroSafeAreaSpec() {
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }
}
