import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "./Auth.css";

interface RegisterProps {
  onSwitchToLogin: () => void;
}

interface DonorForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  bloodType: string;
  address: string;
  maxDistance: number;
  emergencyContact: boolean;
}

interface HospitalForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  registrationNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactPersonName: string;
  contactPersonDesignation: string;
  contactPersonPhone: string;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const HOSPITAL_SERVICES = [
  "Emergency",
  "Surgery",
  "Blood Bank",
  "ICU",
  "Trauma Center",
];

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [userType, setUserType] = useState<"user" | "hospital">("user");
  const [isLoading, setIsLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(
    null
  );
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const { register: registerAccount } = useAuth();

  const donorForm = useForm<DonorForm>();
  const hospitalForm = useForm<HospitalForm>();

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates([
          position.coords.longitude,
          position.coords.latitude,
        ]);
        toast.success("Location captured!");
      },
      () => {
        toast.error("Could not get your location. You can enter it manually below.");
      }
    );
  };

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
         prev.indexOf(service) !== -1
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const onSubmitDonor = async (data: DonorForm) => {
    if (!coordinates) {
      toast.error("Please set your location before registering");
      return;
    }
    setIsLoading(true);
    try {
      await registerAccount(
        {
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          bloodType: data.bloodType,
          coordinates,
          address: data.address,
          maxDistance: Number(data.maxDistance) || 10,
          emergencyContact: !!data.emergencyContact,
        },
        "user"
      );
      toast.success("Registration successful!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitHospital = async (data: HospitalForm) => {
    if (!coordinates) {
      toast.error("Please set your location before registering");
      return;
    }
    setIsLoading(true);
    try {
      await registerAccount(
        {
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          registrationNumber: data.registrationNumber,
          coordinates,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          contactPerson: {
            name: data.contactPersonName,
            designation: data.contactPersonDesignation,
            phone: data.contactPersonPhone,
          },
          services: selectedServices,
        },
        "hospital"
      );
      toast.success("Registration successful!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🩸 BloodConnect</h1>
          <p>Create your account</p>
        </div>

        <div className="user-type-toggle">
          <button
            type="button"
            className={userType === "user" ? "active" : ""}
            onClick={() => setUserType("user")}
          >
            I'm a Donor
          </button>
          <button
            type="button"
            className={userType === "hospital" ? "active" : ""}
            onClick={() => setUserType("hospital")}
          >
            I'm a Hospital
          </button>
        </div>

        {userType === "user" ? (
          <form
            onSubmit={donorForm.handleSubmit(onSubmitDonor)}
            className="auth-form"
          >
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                {...donorForm.register("name", { required: "Name is required" })}
                placeholder="Enter your full name"
              />
              {donorForm.formState.errors.name && (
                <span className="error">
                  {donorForm.formState.errors.name.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                {...donorForm.register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                placeholder="Enter your email"
              />
              {donorForm.formState.errors.email && (
                <span className="error">
                  {donorForm.formState.errors.email.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                {...donorForm.register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                placeholder="Create a password"
              />
              {donorForm.formState.errors.password && (
                <span className="error">
                  {donorForm.formState.errors.password.message}
                </span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  {...donorForm.register("phone", {
                    required: "Phone is required",
                  })}
                  placeholder="+919876543210"
                />
                {donorForm.formState.errors.phone && (
                  <span className="error">
                    {donorForm.formState.errors.phone.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="bloodType">Blood Type</label>
                <select
                  id="bloodType"
                  {...donorForm.register("bloodType", {
                    required: "Blood type is required",
                  })}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {BLOOD_TYPES.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
                {donorForm.formState.errors.bloodType && (
                  <span className="error">
                    {donorForm.formState.errors.bloodType.message}
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                {...donorForm.register("address", {
                  required: "Address is required",
                })}
                placeholder="Area, City"
              />
              {donorForm.formState.errors.address && (
                <span className="error">
                  {donorForm.formState.errors.address.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="maxDistance">Max distance willing to travel (km)</label>
              <input
                type="number"
                id="maxDistance"
                defaultValue={10}
                {...donorForm.register("maxDistance")}
              />
            </div>

            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="emergencyContact"
                {...donorForm.register("emergencyContact")}
              />
              <label htmlFor="emergencyContact">
                Available as emergency contact
              </label>
            </div>

            <div className="form-group">
              <label>Location (required for donor matching)</label>
              <button
                type="button"
                className="submit-btn"
                style={{ background: "#374151" }}
                onClick={useMyLocation}
              >
                📍 Use My Current Location
              </button>
              {coordinates && (
                <span style={{ fontSize: "0.8rem", color: "#059669" }}>
                  Location set: {coordinates[1].toFixed(4)}, {coordinates[0].toFixed(4)}
                </span>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="submit-btn">
              {isLoading ? "Creating Account..." : "Register as Donor"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={hospitalForm.handleSubmit(onSubmitHospital)}
            className="auth-form"
          >
            <div className="form-group">
              <label htmlFor="hname">Hospital Name</label>
              <input
                id="hname"
                {...hospitalForm.register("name", {
                  required: "Hospital name is required",
                })}
                placeholder="Enter hospital name"
              />
              {hospitalForm.formState.errors.name && (
                <span className="error">
                  {hospitalForm.formState.errors.name.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="hemail">Email Address</label>
              <input
                type="email"
                id="hemail"
                {...hospitalForm.register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                placeholder="Enter hospital email"
              />
              {hospitalForm.formState.errors.email && (
                <span className="error">
                  {hospitalForm.formState.errors.email.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="hpassword">Password</label>
              <input
                type="password"
                id="hpassword"
                {...hospitalForm.register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                placeholder="Create a password"
              />
              {hospitalForm.formState.errors.password && (
                <span className="error">
                  {hospitalForm.formState.errors.password.message}
                </span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hphone">Phone</label>
                <input
                  id="hphone"
                  {...hospitalForm.register("phone", {
                    required: "Phone is required",
                  })}
                  placeholder="+911126588500"
                />
              </div>
              <div className="form-group">
                <label htmlFor="regNumber">Registration Number</label>
                <input
                  id="regNumber"
                  {...hospitalForm.register("registrationNumber", {
                    required: "Registration number is required",
                  })}
                  placeholder="DLH0002"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="haddress">Address</label>
              <input
                id="haddress"
                {...hospitalForm.register("address", {
                  required: "Address is required",
                })}
                placeholder="Street address"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  {...hospitalForm.register("city", {
                    required: "City is required",
                  })}
                  placeholder="New Delhi"
                />
              </div>
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  id="state"
                  {...hospitalForm.register("state", {
                    required: "State is required",
                  })}
                  placeholder="Delhi"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pincode">Pincode</label>
              <input
                id="pincode"
                {...hospitalForm.register("pincode", {
                  required: "Pincode is required",
                })}
                placeholder="110001"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cpName">Contact Person Name</label>
                <input
                  id="cpName"
                  {...hospitalForm.register("contactPersonName", {
                    required: "Contact person is required",
                  })}
                  placeholder="Dr. Name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="cpDesignation">Designation</label>
                <input
                  id="cpDesignation"
                  {...hospitalForm.register("contactPersonDesignation", {
                    required: "Designation is required",
                  })}
                  placeholder="Chief Medical Officer"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="cpPhone">Contact Person Phone</label>
              <input
                id="cpPhone"
                {...hospitalForm.register("contactPersonPhone", {
                  required: "Contact person phone is required",
                })}
                placeholder="+911126588501"
              />
            </div>

            <div className="form-group">
              <label>Services Offered</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                {HOSPITAL_SERVICES.map((service) => (
                  <label
                    key={service}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedServices.indexOf(service) !== -1}
                    
                      onChange={() => toggleService(service)}
                    />
                    {service}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Location (required for donor matching)</label>
              <button
                type="button"
                className="submit-btn"
                style={{ background: "#374151" }}
                onClick={useMyLocation}
              >
                📍 Use My Current Location
              </button>
              {coordinates && (
                <span style={{ fontSize: "0.8rem", color: "#059669" }}>
                  Location set: {coordinates[1].toFixed(4)}, {coordinates[0].toFixed(4)}
                </span>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="submit-btn">
              {isLoading ? "Creating Account..." : "Register Hospital"}
            </button>
          </form>
        )}

        <div className="demo-credentials">
          <p style={{ textAlign: "center", margin: 0 }}>
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              style={{
                background: "none",
                border: "none",
                color: "#dc2626",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
      <div className="extra">
        <p>&#169;Made by Tejas Sharma</p>
      </div>
    </div>
  );
};

export default Register;
