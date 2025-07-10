package com.rcs.blue_app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavBackStackEntry
import androidx.navigation.NavHostController
import androidx.navigation.compose.currentBackStackEntryAsState
import com.rcs.blue_app.ui.navigation.BottomNavItem
import com.rcs.blue_app.ui.navigation.Screen
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.navigation.NavGraph.Companion.findStartDestination

@Composable
fun BottomNavBar(
    navController: NavHostController, // Este es el mainNavController ahora
    bottomNavController: NavHostController, // Nuevo parámetro para navegación local
    onItemSelected: (String) -> Unit
) {
    val items = listOf(
        BottomNavItem.Home,
        BottomNavItem.Profile,
        BottomNavItem.Notifications,
        BottomNavItem.Settings
    )

    // Usamos bottomNavController para determinar la ruta actual
    val navBackStackEntry: NavBackStackEntry? = bottomNavController.currentBackStackEntryAsState().value
    val currentRoute = navBackStackEntry?.destination?.route

    val showFab = currentRoute in listOf(
        Screen.Main.Home.route,
        Screen.Main.Profile.route,
        Screen.Main.Notifications.route
    )

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(96.dp)
    ) {
        NavigationBar(
            modifier = Modifier
                .fillMaxWidth()
                .height(96.dp)
                .align(Alignment.BottomCenter),
            tonalElevation = 0.dp
        ) {
            listOf(items[0], items[1], null, items[2], items[3]).forEachIndexed { _, item ->
                if (item == null) {
                    NavigationBarItem(
                        icon = { Spacer(Modifier.size(24.dp)) },
                        label = { Text("") },
                        selected = false,
                        onClick = {}
                    )
                } else {
                    NavigationBarItem(
                        icon = {
                            Icon(
                                imageVector = item.icon,
                                contentDescription = stringResource(id = item.title),
                                modifier = Modifier.size(24.dp)
                            )
                        },
                        label = {
                            Text(
                                text = stringResource(id = item.title),
                                style = MaterialTheme.typography.labelSmall
                            )
                        },
                        selected = currentRoute == item.route,
                        onClick = { onItemSelected(item.route) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = MaterialTheme.colorScheme.primary,
                            selectedTextColor = MaterialTheme.colorScheme.primary,
                            unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                            unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant,
                            indicatorColor = Color.Transparent
                        )
                    )
                }
            }
        }

        AnimatedVisibility(
            visible = showFab,
            enter = fadeIn() + expandVertically(
                expandFrom = Alignment.Bottom,
                animationSpec = tween(durationMillis = 300)
            ),
            exit = fadeOut() + shrinkVertically(
                shrinkTowards = Alignment.Bottom,
                animationSpec = tween(durationMillis = 300)
            ),
            modifier = Modifier.align(Alignment.TopCenter)
        ) {
            FloatingActionButton(
                onClick = {
                    // Usamos navController (mainNavController) para navegar a CreateArticle
                    navController.navigate(Screen.CreateArticle.route) {
                        launchSingleTop = true
                        popUpTo(navController.graph.findStartDestination().id) {
                            saveState = true
                        }
                    }
                },
                modifier = Modifier
                    .size(56.dp)
                    .offset(y = (-16).dp),
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary,
                shape = CircleShape,
                elevation = FloatingActionButtonDefaults.elevation(
                    defaultElevation = 6.dp,
                    pressedElevation = 12.dp,
                    hoveredElevation = 8.dp,
                    focusedElevation = 8.dp
                )
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "Add Article",
                    modifier = Modifier.size(24.dp)
                )
            }
        }
    }
}