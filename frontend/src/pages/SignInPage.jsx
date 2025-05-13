import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authAPI, programsAPI, curriculumsAPI } from "@/lib/api";
import { APP_NAME } from "@/lib/config";
import { authToastFunctions } from "@/lib/toast";
import appLogo from "@/assets/app-logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SignInPage = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    programId: '',
    curriculumId: ''
  });
  const [programs, setPrograms] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch programs on component mount
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await programsAPI.getAllPrograms();
        setPrograms(response.data || []);
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };
    fetchPrograms();
  }, []);

  // Fetch curriculums when program is selected
  const handleProgramChange = async (programId) => {
    setFormData(prev => ({ ...prev, programId, curriculumId: '' }));
    setCurriculums([]);
    
    if (programId) {
      try {
        const response = await curriculumsAPI.getCurriculumsByProgramId(programId);
        setCurriculums(response || []);
      } catch (error) {
        console.error('Error fetching curriculums:', error);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.endsWith('@up.edu.ph')) {
      newErrors.email = 'Only UP Mail accounts are allowed';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Registration specific validations
    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Full name is required';
      }
      if (!formData.programId) {
        newErrors.programId = 'Degree program is required';
      }
      if (!formData.curriculumId) {
        newErrors.curriculumId = 'Curriculum is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const success = await login({
          email: formData.email,
          password: formData.password
        });
        
        if (success) {
          authToastFunctions.signInSuccess();
          // The navigation will be handled by the useEffect below
        } else {
          authToastFunctions.signInError();
        }
      } else {
        await authAPI.register(formData);
        authToastFunctions.accountCreated();
        setIsLogin(true);
      }
    } catch {
      if (isLogin) {
        authToastFunctions.signInError();
      } else {
        authToastFunctions.accountCreationError();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle navigation after successful login
  useEffect(() => {
    if (user) {
      if (user.role?.toLowerCase() === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

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
          <CardTitle className="text-xl text-white">{isLogin ? 'Welcome Back!' : 'Create Account'}</CardTitle>
          <CardDescription className="text-white">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">UP Mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={`bg-white text-gray-900 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="username@up.edu.ph"
              />
              {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className={`bg-white text-gray-900 ${errors.password ? 'border-red-500' : ''}`}
              />
              {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`bg-white text-gray-900 ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="programId" className="text-white">Degree Program</Label>
                  <Select
                    value={formData.programId}
                    onValueChange={handleProgramChange}
                  >
                    <SelectTrigger className={`bg-white text-gray-900 ${errors.programId ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select a program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.program_id} value={program.program_id.toString()}>
                          {program.acronym} - {program.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.programId && <p className="text-red-400 text-sm">{errors.programId}</p>}
                </div>

                {formData.programId && (
                  <div className="space-y-2">
                    <Label htmlFor="curriculumId" className="text-white">Curriculum</Label>
                    <Select
                      value={formData.curriculumId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, curriculumId: value }))}
                    >
                      <SelectTrigger className={`bg-white text-gray-900 ${errors.curriculumId ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select a curriculum" />
                      </SelectTrigger>
                      <SelectContent>
                        {curriculums.map((curriculum) => (
                          <SelectItem key={curriculum.curriculum_id} value={curriculum.curriculum_id.toString()}>
                            {curriculum.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.curriculumId && <p className="text-red-400 text-sm">{errors.curriculumId}</p>}
                  </div>
                )}
              </>
            )}

            <Button
              type="submit"
              className={`w-full ${
                isLogin 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            variant="link"
            className="text-white hover:text-gray-200 underline-offset-4"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignInPage;