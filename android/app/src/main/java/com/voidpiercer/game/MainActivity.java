package com.voidpiercer.game;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    WindowInsetsControllerCompat windowInsetsController =
        WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
    // Configure the behavior of the hidden system bars
    windowInsetsController.setSystemBarsBehavior(
        WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    );
    // Hide both the status bar
    windowInsetsController.hide(WindowInsetsCompat.Type.statusBars());
  }
}
