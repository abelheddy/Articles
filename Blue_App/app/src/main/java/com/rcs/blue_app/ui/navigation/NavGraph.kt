package com.rcs.blue_app.ui.navigation

import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import androidx.navigation.navigation
import com.rcs.blue_app.R
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import com.rcs.blue_app.ui.screens.article.CreateArticleScreen
import com.rcs.blue_app.ui.screens.auth.LoginScreen
import com.rcs.blue_app.ui.screens.main.MainScreen
import com.rcs.blue_app.ui.screens.splash.SplashScreen

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Login : Screen("login")
    object Main : Screen("main") {
        object Home : Screen("home")
        object Profile : Screen("profile")
        object Notifications : Screen("notifications")
        object Settings : Screen("settings")
    }
    object CreateArticle : Screen("articles/create")
}

object Routes {
    const val APP_GRAPH = "app_graph"
}

sealed class BottomNavItem(
    val title: Int,
    val icon: ImageVector,
    val route: String
) {
    object Home : BottomNavItem(R.string.home, Icons.Filled.Home, Screen.Main.Home.route)
    object Profile : BottomNavItem(R.string.profile, Icons.Filled.Person, Screen.Main.Profile.route)
    object Notifications : BottomNavItem(R.string.notifications, Icons.Filled.Notifications, Screen.Main.Notifications.route)
    object Settings : BottomNavItem(R.string.settings, Icons.Filled.Settings, Screen.Main.Settings.route)
}

fun NavGraphBuilder.appNavGraph(navController: NavHostController) {
    navigation(
        startDestination = Screen.Splash.route,
        route = Routes.APP_GRAPH
    ) {
        composable(
            route = Screen.Splash.route,
            enterTransition = {
                slideInHorizontally(initialOffsetX = { -it }, animationSpec = tween(300))
            },
            exitTransition = {
                fadeOut(animationSpec = tween(100))
            }
        ) { SplashScreen(navController) }

        composable(
            route = Screen.Login.route,
            enterTransition = {
                slideInHorizontally(initialOffsetX = { it }, animationSpec = tween(300))
            },
            exitTransition = {
                fadeOut(animationSpec = tween(100))
            }
        ) { LoginScreen(navController) }

        composable(
            route = Screen.Main.route,
            enterTransition = {
                fadeIn(animationSpec = tween(300))
            },
            exitTransition = {
                fadeOut(animationSpec = tween(100))
            }
        ) { MainScreen(navController) }

        composable(
            route = Screen.CreateArticle.route,
            enterTransition = {
                slideInHorizontally(initialOffsetX = { it }, animationSpec = tween(300))
            },
            popExitTransition = {
                slideOutHorizontally(targetOffsetX = { it }, animationSpec = tween(300))
            }
        ) { CreateArticleScreen(navController = navController) }
    }
}