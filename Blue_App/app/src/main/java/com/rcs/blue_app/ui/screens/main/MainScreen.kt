package com.rcs.blue_app.ui.screens.main

import android.net.http.SslCertificate.saveState
import androidx.compose.foundation.layout.padding
import androidx.compose.material.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.rcs.blue_app.ui.components.BottomNavBar
import com.rcs.blue_app.ui.navigation.BottomNavItem


@Composable
fun MainScreen(mainNavController: NavHostController) {
    val bottomNavController = rememberNavController()

    Scaffold(
        bottomBar = {
            BottomNavBar(
                navController = mainNavController, // Cambia esto a mainNavController
                bottomNavController = bottomNavController, // Añade este parámetro
                onItemSelected = { route ->
                    bottomNavController.navigate(route) {
                        launchSingleTop = true
                        popUpTo(bottomNavController.graph.findStartDestination().id) {
                            saveState = true
                        }
                        restoreState = true
                    }
                }
            )
        }
    ) { innerPadding ->
        NavHost(
            navController = bottomNavController,
            startDestination = BottomNavItem.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(BottomNavItem.Home.route) { HomeScreen() }
            composable(BottomNavItem.Profile.route) { ProfileScreen() }
            composable(BottomNavItem.Notifications.route) { NotificationsScreen() }
            composable(BottomNavItem.Settings.route) { SettingsScreen() }
        }
    }
}