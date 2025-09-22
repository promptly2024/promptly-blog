'use client'
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Save, X, User, Mail, Calendar, Shield } from 'lucide-react';
import { toast } from 'sonner'; // or your preferred toast library
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  siteRole: string;
  createdAt: string;
  updatedAt: string;
}

const Settings = () => {
  const { user: clerkUser, isLoaded } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: ''
  });

  // Fetch user profile from your database
  useEffect(() => {
    if (clerkUser) {
      fetchUserProfile();
    }
  }, [clerkUser]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
        setFormData({
          name: profile.name,
          bio: profile.bio || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      name: userProfile?.name || '',
      bio: userProfile?.bio || ''
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: userProfile?.name || '',
      bio: userProfile?.bio || ''
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio
        })
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setUserProfile(updatedProfile);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        {!isEditing ? (
          <Button onClick={handleEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userProfile.avatarUrl || clerkUser?.imageUrl} />
              <AvatarFallback className="text-lg">
                {userProfile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Profile Picture</p>
              <p className="text-sm text-muted-foreground">
                Managed through your account settings
              </p>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name
            </Label>
            {isEditing ? (
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
              />
            ) : (
              <p className="text-lg font-medium">{userProfile.name}</p>
            )}
          </div>

          {/* Email Field (Read-only) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <p className="text-lg">{userProfile.email}</p>
            <p className="text-sm text-muted-foreground">
              Email cannot be changed here. Use your account settings to modify email.
            </p>
          </div>

          {/* Bio Field */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            {isEditing ? (
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            ) : (
              <p className="text-lg whitespace-pre-wrap">
                {userProfile.bio || 'No bio added yet.'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4" />
                Role
              </Label>
              <Badge variant="secondary" className="capitalize">
                {userProfile.siteRole}
              </Badge>
            </div>
            
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4" />
                Member Since
              </Label>
              <p className="text-sm">
                {new Date(userProfile.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          <div>
            <Label>Last Updated</Label>
            <p className="text-sm text-muted-foreground">
              {new Date(userProfile.updatedAt).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
