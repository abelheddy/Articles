package com.rcs.blue_app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = Color(0xFF0066CC),
    onPrimary = Color.White,
    secondary = Color(0xFF6D28D9),
    onSecondary = Color.White,
    tertiary = Color(0xFF0D9488),
    background = Color(0xFFF8FAFC),
    surface = Color.White,
    onSurface = Color(0xFF1E293B),
    // ... otros colores según necesites
)

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF66A3FF),
    onPrimary = Color.Black,
    secondary = Color(0xFFA78BFA),
    onSecondary = Color.Black,
    tertiary = Color(0xFF5EEAD4),
    background = Color(0xFF0F172A),
    surface = Color(0xFF1E293B),
    onSurface = Color(0xFFE2E8F0),
    // ... otros colores según necesites
)

@Composable
fun BlueAppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colors = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colors,
        typography = Typography,
        content = content
    )
}

// Extender MaterialTheme para acceder a colores fácilmente
object BlueAppTheme {
    val colors: ColorScheme
        @Composable
        get() = MaterialTheme.colorScheme
}