import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authAPI } from "@/lib/api";
import { APP_NAME } from "@/lib/config";
import { authToastFunctions } from "@/lib/toast";
import appLogo from "@/assets/app-logo.png";

const SignInPage = () => {
  const handleGoogleSignIn = () => {
    try {
      // Redirect to the backend's Google auth route
      window.location.href = authAPI.getGoogleAuthUrl();
    } catch (error) {
      console.error('Failed to connect to authentication service:', error);
      authToastFunctions.signInError();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[hsl(220,10%,15%)] p-4">
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="flex items-center justify-center mb-4 gap-4">
          <img src={appLogo} alt="App Logo" className="h-12 w-12 object-contain" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 m-0">{APP_NAME}</h1>
        </div>
      </div>

      <Card className="w-full max-w-md bg-[#7b1113] dark:bg-[#4a0a0b] text-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-white">Welcome!</CardTitle>
          <CardDescription className="text-white">Sign in using your UP Mail account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGoogleSignIn} 
            className="w-full flex items-center justify-center gap-2 bg-white text-[#7b1113] hover:bg-gray-100 border-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
            Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;