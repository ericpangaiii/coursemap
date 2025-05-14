import appLogo from "@/assets/app-logo.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { authAPI, curriculumsAPI, programsAPI } from "@/lib/api";
import { APP_NAME } from "@/lib/config";
import { authToastFunctions } from "@/lib/toast";
import { CheckCircle2, LogIn, UserPlus, XCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignInPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    programId: '',
    curriculumId: ''
  });
  const [programs, setPrograms] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validation, setValidation] = useState({
    email: { isValid: true, message: '' },
    password: { isValid: true, message: '' },
    firstName: { isValid: true, message: '' },
    middleName: { isValid: true, message: '' },
    lastName: { isValid: true, message: '' },
    suffix: { isValid: true, message: '' },
    program: { isValid: true, message: '' },
    curriculum: { isValid: true, message: '' }
  });

  const suffixOptions = [
    { value: 'none', label: 'None' },
    { value: 'Jr.', label: 'Jr.' },
    { value: 'Sr.', label: 'Sr.' },
    { value: 'II', label: 'II' },
    { value: 'III', label: 'III' },
    { value: 'IV', label: 'IV' },
    { value: 'V', label: 'V' }
  ];

  // Real-time validation functions
  const validateEmail = (email) => {
    if (!email) {
      return { isValid: false, message: 'Email is required' };
    }
    if (!email.endsWith('@up.edu.ph')) {
      return { isValid: false, message: 'Must be a UP Mail address' };
    }
    return { isValid: true, message: 'Valid UP Mail address' };
  };

  const validatePassword = (password) => {
    if (!password) {
      return { isValid: false, message: 'Password is required' };
    }
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters' };
    }
    return { isValid: true, message: 'Password meets requirements' };
  };

  const validateFirstName = (firstName) => {
    if (!firstName) {
      return { isValid: false, message: 'First name is required' };
    }
    if (firstName.length < 2) {
      return { isValid: false, message: 'First name must be at least 2 characters' };
    }
    if (!/^[A-Za-z\s-']+$/.test(firstName)) {
      return { isValid: false, message: 'First name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    return { isValid: true, message: 'Valid first name' };
  };

  const validateMiddleName = (middleName) => {
    if (middleName && !/^[A-Za-z\s-']+$/.test(middleName)) {
      return { isValid: false, message: 'Middle name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    return { isValid: true, message: 'Valid middle name' };
  };

  const validateLastName = (lastName) => {
    if (!lastName) {
      return { isValid: false, message: 'Last name is required' };
    }
    if (lastName.length < 2) {
      return { isValid: false, message: 'Last name must be at least 2 characters' };
    }
    if (!/^[A-Za-z\s-']+$/.test(lastName)) {
      return { isValid: false, message: 'Last name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    return { isValid: true, message: 'Valid last name' };
  };

  const validateSuffix = (suffix) => {
    if (suffix && !/^[A-Za-z\s.]+$/.test(suffix)) {
      return { isValid: false, message: 'Suffix can only contain letters, spaces, and periods' };
    }
    return { isValid: true, message: 'Valid suffix' };
  };

  const validateProgram = (programId) => {
    if (!programId) {
      return { isValid: false, message: 'Please select a program' };
    }
    return { isValid: true, message: 'Program selected' };
  };

  const validateCurriculum = (curriculumId) => {
    if (!curriculumId) {
      return { isValid: false, message: 'Please select a curriculum' };
    }
    return { isValid: true, message: 'Curriculum selected' };
  };

  // Handle input changes with real-time validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validate the changed field
    let validationResult;
    switch (name) {
      case 'email':
        validationResult = validateEmail(value);
        break;
      case 'password':
        validationResult = validatePassword(value);
        break;
      case 'firstName':
        validationResult = validateFirstName(value);
        break;
      case 'middleName':
        validationResult = validateMiddleName(value);
        break;
      case 'lastName':
        validationResult = validateLastName(value);
        break;
      case 'suffix':
        validationResult = validateSuffix(value);
        break;
      default:
        return;
    }

    setValidation(prev => ({
      ...prev,
      [name]: validationResult
    }));
  };

  // Handle select changes with validation
  const handleProgramChange = async (programId) => {
    setFormData(prev => ({ ...prev, programId, curriculumId: '' }));
    setCurriculums([]);
    
    setValidation(prev => ({
      ...prev,
      program: validateProgram(programId),
      curriculum: { isValid: false, message: 'Curriculum is required' }
    }));
    
    if (programId) {
      try {
        const response = await curriculumsAPI.getCurriculumsByProgramId(programId);
        setCurriculums(response || []);
      } catch (error) {
        console.error('Error fetching curriculums:', error);
      }
    }
  };

  const handleCurriculumChange = (curriculumId) => {
    setFormData(prev => ({ ...prev, curriculumId }));
    setValidation(prev => ({
      ...prev,
      curriculum: validateCurriculum(curriculumId)
    }));
  };

  // Fetch programs when select is opened
  const handleProgramSelectOpen = async (open) => {
    if (open && programs.length === 0) {
      try {
        const response = await programsAPI.getAllPrograms();
        setPrograms(response.data || []);
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    }
  };

  const isFormValid = () => {
    if (isLogin) {
      return formData.email && formData.password;
    }
    
    return (
      formData.email &&
      formData.password &&
      formData.firstName &&
      formData.lastName &&
      formData.programId &&
      formData.curriculumId
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      authToastFunctions.accountCreationInvalidData();
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Sign in logic
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
        if (response && response.user) {
          await login({
            email: formData.email,
            password: formData.password
          });
          authToastFunctions.signInSuccess();
          navigate(response.user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
        }
      } else {
        // Sign up logic
        await authAPI.register({
          ...formData,
          name: `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}${formData.suffix && formData.suffix !== 'none' ? ' ' + formData.suffix : ''}`
        });
        authToastFunctions.accountCreated();
        setIsLogin(true);
      }
    } catch (error) {
      console.error(isLogin ? 'Login error:' : 'Registration error:', error);
      
      if (isLogin) {
        // Handle login errors
        if (error.message === 'Invalid email or password') {
          authToastFunctions.signInInvalidCredentials();
        } else if (error.message.includes('Network Error') || !navigator.onLine) {
          authToastFunctions.signInNetworkError();
        } else if (error.message.includes('500') || error.message.includes('Server Error')) {
          authToastFunctions.signInServerError();
        } else {
          authToastFunctions.signInError();
        }
      } else {
        // Handle registration errors
        if (error.message === 'Email already exists') {
          authToastFunctions.accountCreationEmailExists();
        } else if (error.message.includes('Network Error') || !navigator.onLine) {
          authToastFunctions.signInNetworkError();
        } else if (error.message.includes('500') || error.message.includes('Server Error')) {
          authToastFunctions.accountCreationServerError();
        } else if (error.message.includes('required') || error.message.includes('invalid')) {
          authToastFunctions.accountCreationInvalidData();
        } else {
          authToastFunctions.accountCreationError();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Validation status component
  const ValidationStatus = ({ isValid, message, value }) => {
    // Don't show validation if field is empty
    if (!value) return null;
    
    return (
      <div className={`flex items-center gap-1 text-sm mt-1 ${isValid ? 'text-green-500' : 'text-red-500'}`}>
        {isValid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
        <span>{message}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[hsl(220,10%,15%)] p-4">
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="flex items-center justify-center mb-4 gap-4">
          <img src={appLogo} alt="App Logo" className="h-12 w-12 object-contain" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 m-0">{APP_NAME}</h1>
        </div>
      </div>

      <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900 dark:text-gray-100">{isLogin ? 'Welcome Back!' : 'Create Account'}</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900 dark:text-gray-100">UP Mail <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="username@up.edu.ph"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`bg-white text-gray-900 ${
                    !validation.email.isValid ? 'border-red-500' : 
                    validation.email.isValid && formData.email ? 'border-green-500' : ''
                  }`}
                />
                <ValidationStatus 
                  isValid={validation.email.isValid} 
                  message={validation.email.message}
                  value={formData.email}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900 dark:text-gray-100">Password <span className="text-red-500">*</span></Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={`bg-white text-gray-900 ${
                    !validation.password.isValid ? 'border-red-500' : 
                    validation.password.isValid && formData.password ? 'border-green-500' : ''
                  }`}
                />
                <ValidationStatus 
                  isValid={validation.password.isValid} 
                  message={validation.password.message}
                  value={formData.password}
                />
              </div>

              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-gray-900 dark:text-gray-100">First Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="Juan"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className={`bg-white text-gray-900 ${
                          !validation.firstName.isValid ? 'border-red-500' : 
                          validation.firstName.isValid && formData.firstName ? 'border-green-500' : ''
                        }`}
                      />
                      <ValidationStatus 
                        isValid={validation.firstName.isValid} 
                        message={validation.firstName.message}
                        value={formData.firstName}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="middleName" className="text-gray-900 dark:text-gray-100">Middle Name <span className="text-gray-500 text-xs">(Optional)</span></Label>
                      <Input
                        id="middleName"
                        name="middleName"
                        type="text"
                        placeholder="Santos"
                        value={formData.middleName}
                        onChange={handleInputChange}
                        className={`bg-white text-gray-900 ${
                          !validation.middleName.isValid ? 'border-red-500' : 
                          validation.middleName.isValid && formData.middleName ? 'border-green-500' : ''
                        }`}
                      />
                      <ValidationStatus 
                        isValid={validation.middleName.isValid} 
                        message={validation.middleName.message}
                        value={formData.middleName}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-900 dark:text-gray-100">Last Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Dela Cruz"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className={`bg-white text-gray-900 ${
                          !validation.lastName.isValid ? 'border-red-500' : 
                          validation.lastName.isValid && formData.lastName ? 'border-green-500' : ''
                        }`}
                      />
                      <ValidationStatus 
                        isValid={validation.lastName.isValid} 
                        message={validation.lastName.message}
                        value={formData.lastName}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="suffix" className="text-gray-900 dark:text-gray-100">Suffix <span className="text-gray-500 text-xs">(Optional)</span></Label>
                      <Select
                        value={formData.suffix || 'none'}
                        onValueChange={(value) => handleInputChange({ target: { name: 'suffix', value } })}
                      >
                        <SelectTrigger className="bg-white text-gray-900">
                          <SelectValue placeholder="Select suffix" />
                        </SelectTrigger>
                        <SelectContent>
                          {suffixOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <ValidationStatus 
                        isValid={validation.suffix.isValid} 
                        message={validation.suffix.message}
                        value={formData.suffix}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="programId" className="text-gray-900 dark:text-gray-100">Degree Program <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.programId}
                      onValueChange={handleProgramChange}
                      onOpenChange={handleProgramSelectOpen}
                    >
                      <SelectTrigger className={`bg-white text-gray-900 ${
                        !validation.program.isValid ? 'border-red-500' : 
                        validation.program.isValid && formData.programId ? 'border-green-500' : ''
                      }`}>
                        <SelectValue placeholder="Select your program" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs.map((program) => (
                          <SelectItem key={program.program_id} value={program.program_id.toString()}>
                            {program.acronym} - {program.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ValidationStatus 
                      isValid={validation.program.isValid} 
                      message={validation.program.message}
                      value={formData.programId}
                    />
                  </div>

                  {formData.programId && (
                    <div className="space-y-2">
                      <Label htmlFor="curriculumId" className="text-gray-900 dark:text-gray-100">Curriculum <span className="text-red-500">*</span></Label>
                      <Select
                        value={formData.curriculumId}
                        onValueChange={handleCurriculumChange}
                      >
                        <SelectTrigger className={`bg-white text-gray-900 ${
                          !validation.curriculum.isValid ? 'border-red-500' : 
                          validation.curriculum.isValid && formData.curriculumId ? 'border-green-500' : ''
                        }`}>
                          <SelectValue placeholder="Select your curriculum" />
                        </SelectTrigger>
                        <SelectContent>
                          {curriculums.map((curriculum) => (
                            <SelectItem key={curriculum.curriculum_id} value={curriculum.curriculum_id.toString()}>
                              {curriculum.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <ValidationStatus 
                        isValid={validation.curriculum.isValid} 
                        message={validation.curriculum.message}
                        value={formData.curriculumId}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <Button
              type="submit"
              className={`w-full ${
                isLogin 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? (
                'Please wait...'
              ) : isLogin ? (
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </div>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            variant="link"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 underline-offset-4"
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