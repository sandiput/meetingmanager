@@ .. @@
 use Illuminate\Database\Eloquent\Factories\HasFactory;
 use Illuminate\Foundation\Auth\User as Authenticatable;
 use Illuminate\Notifications\Notifiable;
+use Tymon\JWTAuth\Contracts\JWTSubject;
 
-class User extends Authenticatable
+class User extends Authenticatable implements JWTSubject
 {
     use HasFactory, Notifiable;
 
@@ .. @@
     protected $casts = [
         'email_verified_at' => 'datetime',
         'password' => 'hashed',
     ];
+
+    /**
+     * Get the identifier that will be stored in the subject claim of the JWT.
+     *
+     * @return mixed
+     */
+    public function getJWTIdentifier()
+    {
+        return $this->getKey();
+    }
+
+    /**
+     * Return a key value array, containing any custom claims to be added to the JWT.
+     *
+     * @return array
+     */
+    public function getJWTCustomClaims()
+    {
+        return [];
+    }
 }