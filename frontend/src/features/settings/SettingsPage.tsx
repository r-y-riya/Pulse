import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Settings, User as UserIcon, Lock, Moon, ShieldAlert, Save
} from 'lucide-react';
import api from '../../services/api';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  
  // Profile settings states
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.profile?.age || 25);
  const [weight, setWeight] = useState(user?.profile?.weight || 70);
  const [height, setHeight] = useState(user?.profile?.height || 175);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(user?.profile?.gender || 'male');
  const [activity, setActivity] = useState(user?.profile?.activityLevel || 'moderately_active');
  const [workoutPreference, setWorkoutPreference] = useState(user?.profile?.workoutPreference || 'hypertrophy');
  const [experience, setExperience] = useState(user?.profile?.experienceLevel || 'intermediate');
  const [days, setDays] = useState(user?.profile?.workoutDaysPerWeek || 4);
  const [savingProfile, setSavingProfile] = useState(false);

  // Security password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        name,
        profile: {
          age,
          weight,
          height,
          gender,
          activityLevel: activity,
          workoutPreference: workoutPreference as any,
          experienceLevel: experience,
          workoutDaysPerWeek: days
        }
      });
      toast.success("Profile parameters synchronized successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile parameters");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match!");
    }
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters long.");
    }

    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', {
        oldPassword,
        newPassword
      });
      toast.success("Password updated successfully!");
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update security credentials.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-text-heading">Settings Console</h2>
        <p className="text-sm text-text-muted mt-1 font-medium">Configure your biometrics, target indices, and security credentials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biometrics Setup Form */}
        <div className="lg:col-span-2 pulse-card space-y-6">
          <h3 className="text-sm font-bold text-text-heading flex items-center gap-1.5 border-b border-border pb-3 uppercase tracking-wider">
            <UserIcon size={16} className="text-primary" /> Biometric Profile Setup
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pulse-input w-full"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wide">Biological Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="pulse-input w-full font-bold text-text-body"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wide">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 25)}
                  className="pulse-input w-full"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wide">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value) || 175)}
                  className="pulse-input w-full"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wide">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(parseInt(e.target.value) || 70)}
                  className="pulse-input w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wide">Activity Level</label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value as any)}
                  className="pulse-input w-full font-bold text-text-body"
                >
                  <option value="sedentary">Sedentary (No Exercise)</option>
                  <option value="lightly_active">Light Activity (1-2 days/week)</option>
                  <option value="moderately_active">Moderately Active (3-4 days/week)</option>
                  <option value="very_active">Very Active (5+ days/week)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wide">Training Goal</label>
                <select
                  value={workoutPreference}
                  onChange={(e) => setWorkoutPreference(e.target.value as any)}
                  className="pulse-input w-full font-bold text-text-body"
                >
                  <option value="hypertrophy">Muscle Hypertrophy</option>
                  <option value="strength">Absolute Strength</option>
                  <option value="endurance">Endurance & Running</option>
                  <option value="rehab">Active Rehabilitation</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wide">Experience Level</label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value as any)}
                  className="pulse-input w-full font-bold text-text-body"
                >
                  <option value="beginner">Beginner (Under 1 Year)</option>
                  <option value="intermediate">Intermediate (1-3 Years)</option>
                  <option value="advanced">Advanced (3+ Years)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wide">Workout Target Days (WoW)</label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value) || 4)}
                  className="pulse-input w-full"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full pulse-btn-primary flex items-center justify-center gap-1.5"
            >
              <Save size={16} />
              <span>{savingProfile ? "Saving profile..." : "Save Biometric Settings"}</span>
            </button>
          </form>
        </div>

        {/* Security Password Box */}
        <div className="pulse-card space-y-6">
          <h3 className="text-sm font-bold text-text-heading flex items-center gap-1.5 border-b border-border pb-3 uppercase tracking-wider">
            <Lock size={16} className="text-primary" /> Credentials Security
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wide">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="pulse-input w-full"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wide">New Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pulse-input w-full"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wide">Confirm New Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pulse-input w-full"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="w-full pulse-btn-primary flex items-center justify-center gap-1.5"
            >
              <Save size={16} />
              <span>{savingPassword ? "Updating..." : "Update Security Credentials"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
