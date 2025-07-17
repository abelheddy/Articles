package com.rcs.blue_app.extensions

import android.content.Context
import android.net.Uri
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import java.io.FileOutputStream

fun Uri.toMultipartBody(context: Context, partName: String): MultipartBody.Part? {
    return try {
        val inputStream = context.contentResolver.openInputStream(this) ?: return null
        val file = File.createTempFile("upload_", ".tmp", context.cacheDir).apply {
            FileOutputStream(this).use { output ->
                inputStream.copyTo(output)
            }
        }
        MultipartBody.Part.createFormData(
            name = partName,
            filename = "image_${System.currentTimeMillis()}.jpg",
            body = file.asRequestBody("image/*".toMediaTypeOrNull())
        )
    } catch (e: Exception) {
        null
    }
}