package com.rcs.blue_app.ui.screens.article

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.rcs.blue_app.data.model.Article
import com.rcs.blue_app.data.model.ImageToUpload
import com.rcs.blue_app.ui.navigation.Screen
import com.rcs.blue_app.viewmodel.CreateArticleUiState
import com.rcs.blue_app.viewmodel.CreateArticleViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateArticleScreen(
    navController: NavController,
    viewModel: CreateArticleViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val keyboardController = LocalSoftwareKeyboardController.current

    // Estados del formulario
    var name by rememberSaveable { mutableStateOf("") }
    var description by rememberSaveable { mutableStateOf("") }
    var price by rememberSaveable { mutableStateOf("") }

    // Estados para imágenes
    val selectedImages by viewModel.selectedImages.collectAsState()
    var showMultiUrlDialog by remember { mutableStateOf(false) }
    var tempUrls by remember { mutableStateOf<List<String>>(emptyList()) }
    var currentUrlInput by remember { mutableStateOf("") }

    // Launchers para imágenes
    val pickMultipleImagesLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetMultipleContents(),
        onResult = { uris ->
            uris.forEach { uri ->
                viewModel.addImage(
                    ImageToUpload(
                        uri = uri.toString(),
                        type = "DEVICE",
                        localUri = uri
                    )
                )
            }
        }
    )

    // Estado de la UI
    val uiState by viewModel.uiState.collectAsState()

    // Manejo de resultados
    LaunchedEffect(uiState) {
        when (uiState) {
            is CreateArticleUiState.Success -> {
                val articleId = (uiState as CreateArticleUiState.Success).article.id

                if (selectedImages.isNotEmpty()) {
                    val uploadSuccess = viewModel.uploadAllImages(articleId, context)
                    if (!uploadSuccess) {
                        snackbarHostState.showSnackbar("Artículo creado pero falló la subida de algunas imágenes")
                    }
                }

                snackbarHostState.showSnackbar("Artículo creado exitosamente")
                delay(1500)
                navController.popBackStack()
            }

            is CreateArticleUiState.Error -> {
                snackbarHostState.showSnackbar((uiState as CreateArticleUiState.Error).message)
            }

            else -> {}
        }
    }

    // Diálogo para múltiples URLs
    if (showMultiUrlDialog) {
        AlertDialog(
            onDismissRequest = {
                showMultiUrlDialog = false
                tempUrls = emptyList()
            },
            title = { Text("Agregar URLs de imágenes") },
            text = {
                Column {
                    OutlinedTextField(
                        value = currentUrlInput,
                        onValueChange = { currentUrlInput = it },
                        label = { Text("URL de imagen") },
                        placeholder = { Text("https://ejemplo.com/imagen.jpg") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    Button(
                        onClick = {
                            if (currentUrlInput.isNotBlank()) {
                                tempUrls = tempUrls + currentUrlInput
                                currentUrlInput = ""
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 8.dp),
                        enabled = currentUrlInput.isNotBlank()
                    ) {
                        Text("Agregar a la lista")
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Text("URLs a agregar:", style = MaterialTheme.typography.labelMedium)

                    LazyColumn(modifier = Modifier.height(100.dp)) {
                        items(tempUrls) { url ->
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(
                                    text = url.take(30) + if (url.length > 30) "..." else "",
                                    modifier = Modifier
                                        .weight(1f)
                                        .padding(8.dp),
                                    maxLines = 1
                                )
                                IconButton(
                                    onClick = { tempUrls = tempUrls - url }
                                ) {
                                    Icon(Icons.Default.Close, "Eliminar URL")
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        tempUrls.forEach { url ->
                            viewModel.addImage(
                                ImageToUpload(
                                    uri = url,
                                    type = "URL"
                                )
                            )
                        }
                        tempUrls = emptyList()
                        showMultiUrlDialog = false
                    },
                    enabled = tempUrls.isNotEmpty(),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Agregar ${tempUrls.size} imágenes")
                }
            }
        )
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text("Nuevo Artículo") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Regresar")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Campo de nombre
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Nombre del artículo") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            // Campo de descripción
            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                label = { Text("Descripción") },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp),
                maxLines = 5
            )

            // Campo de precio
            OutlinedTextField(
                value = price,
                onValueChange = { newValue ->
                    if (newValue.isEmpty() || newValue.matches(Regex("^\\d*\\.?\\d*\$"))) {
                        price = newValue
                    }
                },
                label = { Text("Precio") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.fillMaxWidth()
            )

            // Sección de imágenes
            Text(
                text = "Imágenes del artículo (${selectedImages.size})",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.fillMaxWidth()
            )

            // Previsualización de imágenes
            if (selectedImages.isNotEmpty()) {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(selectedImages.size) { index ->
                        Card(
                            modifier = Modifier.size(120.dp),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Box(modifier = Modifier.fillMaxSize()) {
                                AsyncImage(
                                    model = selectedImages[index].uri,
                                    contentDescription = "Imagen del artículo",
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxSize()
                                )
                                IconButton(
                                    onClick = { viewModel.removeImage(index) },
                                    modifier = Modifier
                                        .align(Alignment.TopEnd)
                                        .padding(4.dp)
                                ) {
                                    Icon(
                                        Icons.Default.Close,
                                        contentDescription = "Eliminar imagen",
                                        tint = MaterialTheme.colorScheme.error
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Botones para agregar imágenes
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = { showMultiUrlDialog = true },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.Link, contentDescription = "Desde URL")
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Agregar URLs")
                }

                Button(
                    onClick = { pickMultipleImagesLauncher.launch("image/*") },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.PhotoLibrary, contentDescription = "Desde dispositivo")
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Desde teléfono")
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Botón para crear artículo
            val isLoading = uiState is CreateArticleUiState.Loading

            Button(
                onClick = {
                    keyboardController?.hide()

                    // Validaciones
                    if (name.isBlank() || description.isBlank() || price.isBlank()) {
                        scope.launch {
                            snackbarHostState.showSnackbar("Todos los campos son obligatorios")
                        }
                        return@Button
                    }

                    val priceValue = try {
                        price.toDouble()
                    } catch (e: NumberFormatException) {
                        scope.launch {
                            snackbarHostState.showSnackbar("Ingrese un precio válido")
                        }
                        return@Button
                    }

                    scope.launch {
                        viewModel.createArticle(
                            Article(
                                id = 0,
                                name = name,
                                description = description,
                                price = priceValue,
                                images = emptyList()
                            )
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !isLoading,
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = when {
                        isLoading -> "Creando artículo..."
                        selectedImages.isNotEmpty() -> "Crear artículo con ${selectedImages.size} imágenes"
                        else -> "Crear artículo"
                    },
                    style = MaterialTheme.typography.labelLarge
                )
            }
        }
    }
}