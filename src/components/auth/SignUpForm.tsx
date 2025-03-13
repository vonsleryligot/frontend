import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { signUp } from "../../api";

export default function SignUpForm() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [title, setTitle] = useState("Mr.");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [postalCodes, setPostalCodes] = useState<string[]>([]);
  
  const navigate = useNavigate();

  const capitalizeFirstLetter = (name: string) =>
    name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then((res) => res.json())
      .then((data) => {
        const countryNames = data.map((country: any) => country.name.common);
        setCountries(countryNames.sort());
      })
      .catch((error) => console.error("Error fetching countries:", error));
  }, []);

  useEffect(() => {
    if (country) {
      fetch("https://countriesnow.space/api/v0.1/countries/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country }),
      })
        .then((res) => res.json())
        .then((data) => setCities(data.data || []))
        .catch((error) => console.error("Error fetching cities:", error));
    }
  }, [country]);

  useEffect(() => {
    if (country && city) {
      fetch(`https://api.zippopotam.us/${country}/${city}`)
        .then((res) => res.json())
        .then((data) => {
          const codes = data.places?.map((place: any) => place["post code"]) || [];
          setPostalCodes(codes);
        })
        .catch((error) => console.error("Error fetching postal codes:", error));
    }
  }, [country, city]);

  const handleNext = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (step === 1) {
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        setError("All fields are required");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      setStep(2);
    } else {
      if (!country || !city || !postalCode) {
        setError("Please select your country, city, and postal code");
        return;
      }
      if (!acceptTerms) {
        setError("You must accept the terms and conditions");
        return;
      }
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await signUp({
        title,
        firstName,
        lastName,
        email,
        password,
        confirmPassword: password,  // Add this line
        country,
        city,
        postalCode,
        acceptTerms,
     });
     
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
};

  
  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {step === 1 ? "Enter your details to continue." : "Enter your address details."}
            </p>
          </div>
          <form onSubmit={handleNext}>
            <div className="space-y-5">
              {step === 1 && (
                <>
                  {/* Title Dropdown */}
                  <div>
                    <Label>Title</Label>
                    <select
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2 border rounded-lgtext-gray-500 dark:text-gray-400"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                    </select>
                  </div>
                  {/* First Name */}
                  <div>
                    <Label>First Name<span className="text-error-500">*</span></Label>
                    <Input type="text" placeholder="Enter your first name" value={firstName} onChange={(e) => setFirstName(capitalizeFirstLetter(e.target.value))} aria-required="true" />
                  </div>
                  {/* Last Name */}
                  <div>
                    <Label>Last Name<span className="text-error-500">*</span></Label>
                    <Input type="text" placeholder="Enter your last name" value={lastName} onChange={(e) => setLastName(capitalizeFirstLetter(e.target.value))} aria-required="true" />
                  </div>
                  {/* Email */}
                  <div>
                    <Label>Email<span className="text-error-500">*</span></Label>
                    <Input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} aria-required="true" />
                  </div>
                  {/* Password */}
                  <div>
                    <Label>Password<span className="text-error-500">*</span></Label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} aria-required="true" />
                      <span onClick={() => setShowPassword(!showPassword)} className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2">
                        {showPassword ? <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" /> : <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />}
                      </span>
                    </div>
                  </div>
                  {/* Confirm Password */}
                  <div>
                    <Label>Confirm Password<span className="text-error-500">*</span></Label>
                    <div className="relative">
                      <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} aria-required="true" />
                      <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2">
                        {showConfirmPassword ? <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" /> : <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />}
                      </span>
                    </div>
                  </div>
                  <button type="button" onClick={handleNext} className="w-full bg-brand-500 text-white rounded-lg py-3">
                    Next
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                {/* Country Dropdown */}
                <div>
                  <Label>Country<span className="text-error-500">*</span></Label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-2 border rounded-lg text-gray-500 dark:text-gray-400"
                  >
                    <option value="">Select your country</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              
                {/* City Dropdown */}
                {country && (
                  <div>
                    <Label>City/State<span className="text-error-500">*</span></Label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2 border rounded-lg text-gray-500 dark:text-gray-400"
                    >
                      <option value="">Select your city</option>
                      {cities.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}
              
                {/* Postal Code Input */}
                {city && (
                  <div>
                    <Label>Postal Code<span className="text-error-500">*</span></Label>
                    <Input
                      type="text"
                      placeholder="Enter your postal code"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>
                )}
              
                {/* Accept Terms Checkbox */}
                <div className="flex items-center gap-3">
                  <Checkbox checked={acceptTerms} onChange={setAcceptTerms} />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    I accept the <span className="text-gray-800 dark:text-white/90">Terms and Conditions</span> and <span className="text-gray-800 dark:text-white">Privacy Policy</span>.
                  </p>
                </div>
              
                {/* Navigation Buttons */}
                <button type="button" onClick={() => setStep(1)} className="w-full bg-gray-500 text-white rounded-lg py-3">
                  Back
                </button>
                <button type="submit" className="w-full bg-brand-500 text-white rounded-lg py-3">
                  {loading ? "Signing Up..." : "Sign Up"}
                </button>
              </>
              
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
