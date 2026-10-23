package com.oda_mobile

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule

/** Exposes per-flavor build settings (see productFlavors in app/build.gradle) to JS. */
class AppConfigModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  override fun getName() = "AppConfig"

  override fun getConstants(): Map<String, Any> =
    mapOf(
      "apiBaseUrl" to BuildConfig.API_BASE_URL,
      "flavor" to BuildConfig.FLAVOR,
    )
}
