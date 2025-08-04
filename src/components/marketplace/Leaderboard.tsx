import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, User } from 'lucide-react';

// Mock leaderboard data - Replace with Supabase query
const leaderboardData = [
  { rank: 1, name: 'Prof. Smith', points: 9999, uploads: 45, downloads: 2340 },
  { rank: 2, name: 'Dr. Johnson', points: 8567, uploads: 38, downloads: 1890 },
  { rank: 3, name: 'Sarah M.', points: 7234, uploads: 32, downloads: 1567 },
  { rank: 4, name: 'Alex K.', points: 6543, uploads: 28, downloads: 1234 },
  { rank: 5, name: 'Maria L.', points: 5876, uploads: 25, downloads: 1098 },
];

export function Leaderboard() {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600';
      default:
        return 'bg-muted';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span>Top Contributors</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {leaderboardData.map((user) => (
          <div 
            key={user.rank}
            className={`p-3 rounded-lg ${getRankColor(user.rank)} ${
              user.rank <= 3 ? 'text-white' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getRankIcon(user.rank)}
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <div className="flex items-center space-x-2 text-xs opacity-80">
                    <span>{user.uploads} uploads</span>
                    <span>•</span>
                    <span>{user.downloads} downloads</span>
                  </div>
                </div>
              </div>
              <Badge 
                variant={user.rank <= 3 ? "outline" : "secondary"}
                className={user.rank <= 3 ? "border-white/30 text-white" : ""}
              >
                {user.points.toLocaleString()} pts
              </Badge>
            </div>
          </div>
        ))}
        
        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            Upload quality content to climb the ranks!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}