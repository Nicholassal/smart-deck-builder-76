import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useDataStore } from "@/hooks/useDataStore";
import { Download, Trash2, User, CreditCard, Shield, Palette, Database, FileText, Coins, Zap } from "lucide-react";

const SettingsView = () => {
  const { toast } = useToast();
  const { files, clearAllData } = useDataStore();
  const [darkMode, setDarkMode] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe", // Mock data - will be replaced with Supabase auth
    email: "john.doe@example.com" // Mock data
  });
  const [tokens, setTokens] = useState(2500); // Mock data
  const [points, setPoints] = useState(150); // Mock data
  const [subscriptionTier, setSubscriptionTier] = useState("free");
  const [storageUsed, setStorageUsed] = useState(75); // Mock percentage
  const [privacySettings, setPrivacySettings] = useState({
    dataForTraining: false,
    analytics: true
  });

  useEffect(() => {
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast({
      title: "Theme Updated",
      description: `Switched to ${newDarkMode ? 'dark' : 'light'} mode`,
    });
  };

  const exportFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    const exportData = {
      file: file,
      decks: file.decks,
      exportDate: new Date().toISOString(),
      appVersion: "1.0.0"
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${file.name}_flashcards.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "File Exported",
      description: `${file.name} has been exported successfully`,
    });
  };

  const handleClearAllData = () => {
    clearAllData();
    toast({
      title: "Data Cleared",
      description: "All local data has been cleared. You can start fresh!",
    });
  };

  const getSubscriptionTierInfo = (tier: string) => {
    switch (tier) {
      case "free":
        return {
          name: "Free Tier",
          description: "Manual flashcard creation only",
          features: ["Manual flashcard creation", "Basic study mode", "Local storage"],
          limitations: ["No AI tutor", "No automatic flashcard generation", "Watch ads for AI features"]
        };
      case "premium":
        return {
          name: "Premium",
          description: "Full AI features with token limits",
          features: ["AI tutor", "Automatic flashcard generation", "All study modes", "Priority support"],
          limitations: ["5000 tokens per month", "Limited AI requests"]
        };
      case "unlimited":
        return {
          name: "Unlimited",
          description: "All features without limits",
          features: ["Unlimited AI usage", "All premium features", "Early access to new features"],
          limitations: []
        };
      default:
        return null;
    }
  };

  const pointsExplanation = {
    "Upload PDF": 10,
    "Create Manual Flashcard": 2,
    "Complete Study Session": 5,
    "Daily Login": 1,
    "Export File": 3
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your Tutor AI preferences and account</p>
        </div>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={profile.name} 
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                * Requires Supabase authentication
              </p>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={profile.email} 
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                * Requires Supabase authentication
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tokens & Points Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Tokens & Points
          </CardTitle>
          <CardDescription>Your current balance and rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AI Tokens</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {tokens.toLocaleString()}
                </Badge>
              </div>
              <Progress value={(tokens / 5000) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Used for AI tutor and flashcard generation
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Reward Points</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  {points}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Earn points by using the app daily
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Points System</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(pointsExplanation).map(([action, points]) => (
                <div key={action} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{action}</span>
                  <span className="font-medium">+{points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Plan
          </CardTitle>
          <CardDescription>Choose your plan and manage billing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="subscription">Current Plan</Label>
            <Select value={subscriptionTier} onValueChange={setSubscriptionTier} disabled>
              <SelectTrigger className="bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free Tier</SelectItem>
                <SelectItem value="premium">Premium - $9.99/month</SelectItem>
                <SelectItem value="unlimited">Unlimited - $19.99/month</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              * Requires Supabase and Stripe integration
            </p>
          </div>

          {getSubscriptionTierInfo(subscriptionTier) && (
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-lg mb-2">
                {getSubscriptionTierInfo(subscriptionTier)?.name}
              </h4>
              <p className="text-muted-foreground mb-4">
                {getSubscriptionTierInfo(subscriptionTier)?.description}
              </p>
              
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium text-sm mb-2">Features:</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {getSubscriptionTierInfo(subscriptionTier)?.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {getSubscriptionTierInfo(subscriptionTier)?.limitations.length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm mb-2">Limitations:</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {getSubscriptionTierInfo(subscriptionTier)?.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-orange-500 rounded-full" />
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Data Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>Download your flashcards and study data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {files.length === 0 ? (
              <p className="text-muted-foreground">No files to export</p>
            ) : (
              files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{file.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {file.decks?.length || 0} decks, {file.decks?.reduce((acc, deck) => acc + (deck.sections?.reduce((secAcc, section) => secAcc + (section.flashcards?.length || 0), 0) || 0), 0) || 0} flashcards
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportFile(file.id)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Appearance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize the app's look and feel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Storage Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Storage
          </CardTitle>
          <CardDescription>Manage your data and storage usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Storage Used</span>
              <span className="text-sm text-muted-foreground">{storageUsed}% of 1GB</span>
            </div>
            <Progress value={storageUsed} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              * Storage calculation requires backend implementation
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription>Control your data and privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="data-training">Use my data for AI training</Label>
                <p className="text-sm text-muted-foreground">
                  Allow anonymized study data to improve AI models
                </p>
              </div>
              <Switch
                id="data-training"
                checked={privacySettings.dataForTraining}
                onCheckedChange={(checked) => 
                  setPrivacySettings({...privacySettings, dataForTraining: checked})
                }
                disabled
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analytics">Analytics & Usage Data</Label>
                <p className="text-sm text-muted-foreground">
                  Help improve the app with usage analytics
                </p>
              </div>
              <Switch
                id="analytics"
                checked={privacySettings.analytics}
                onCheckedChange={(checked) => 
                  setPrivacySettings({...privacySettings, analytics: checked})
                }
                disabled
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Button variant="outline" className="w-full" disabled>
              <FileText className="h-4 w-4 mr-2" />
              Privacy Policy
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              * Privacy settings require Supabase backend implementation
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions that affect your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                Clear All Local Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your local flashcards, study progress, and settings. 
                  This action cannot be undone. Make sure to export any important data first.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearAllData}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, clear all data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" disabled>
            Delete Account & All Data
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            * Account deletion requires Supabase user management
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsView;