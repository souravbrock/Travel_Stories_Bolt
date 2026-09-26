"""CI-only: inject release signing into the generated Capacitor build.gradle."""
import pathlib
import sys

target = pathlib.Path(sys.argv[1])
text = target.read_text(encoding="utf-8")

signing = """    signingConfigs {
        release {
            storeFile file('../release.jks')
            storePassword System.getenv('ANDROID_KEYSTORE_PASSWORD')
            keyAlias System.getenv('ANDROID_KEY_ALIAS')
            keyPassword System.getenv('ANDROID_KEY_PASSWORD')
        }
    }
"""

assert "signingConfigs" not in text, "already patched"
assert "    buildTypes {" in text, "buildTypes block not found"
text = text.replace(
    "    buildTypes {",
    signing + "    buildTypes {",
    1,
)
old_release = """        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }"""
new_release = """        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }"""
assert old_release in text, "release block not found"
text = text.replace(old_release, new_release, 1)
target.write_text(text, encoding="utf-8")
print("patched", target)
