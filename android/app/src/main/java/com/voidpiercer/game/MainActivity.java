package com.voidpiercer.game;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // Sets the theme to AppTheme.NoActionBar, which is a fullscreen theme.
    // This must be called before super.onCreate().
    setTheme(R.style.AppTheme_NoActionBar);
    super.onCreate(savedInstanceState);

    // The previous code to hide the status bar is kept as a fallback.
    WindowInsetsControllerCompat windowInsetsController =
        WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
    windowInsetsController.setSystemBarsBehavior(
        WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    );
    windowInsetsController.hide(WindowInsetsCompat.Type.statusBars());
  }
}
