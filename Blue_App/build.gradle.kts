// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.kapt) apply false
    
}

buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
       // classpath("com.google.dagger:hilt-android-gradle-plugin:2.51.1")
    }
}

tasks.register("clean", Delete::class) {
    delete(rootProject.buildDir)
}