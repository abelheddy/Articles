package com.rcs.blue_app.data.model

import android.net.Uri
import com.google.gson.annotations.SerializedName

data class Article(
    // Check annotations on these parameters carefully
    val id: Int,
    val name: String,
    val description: String,
    val price: Double,
    @SerializedName("images_list") // Example, check your actual annotations
    val images: List<Image>
)

data class Image(
    @SerializedName("id") val id: Int,
    @SerializedName("url") val url: String,
    @SerializedName("type") val type: String,
    @SerializedName("imageable_type") val imageableType: String,
    @SerializedName("imageable_id") val imageableId: Int
)

data class ImageToUpload(
    val uri: String,       // URI local o URL
    val type: String,     // "URL" o "DEVICE"
    val localUri: Uri? = null // Solo para imágenes locales
)