package com.rcs.blue_app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.rememberNavController
import com.rcs.blue_app.ui.navigation.appNavGraph
import com.rcs.blue_app.ui.theme.BlueAppTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            BlueAppTheme {
                val navController = rememberNavController()
                NavHost(
                    navController = navController,
                    startDestination = "app_graph"
                ) {
                    appNavGraph(navController)
                }
            }
        }
    }
}