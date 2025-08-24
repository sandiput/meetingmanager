@@ .. @@
     'guards' => [
         'web' => [
             'driver' => 'session',
             'provider' => 'users',
         ],
+
+        'api' => [
+            'driver' => 'jwt',
+            'provider' => 'users',
+        ],
     ],