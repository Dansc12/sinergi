import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Lock, Globe, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface Group {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  visibility: string;
  member_count: number;
  is_creator: boolean;
}

interface ProfileGroupsFeedProps {
  onEmptyAction: () => void;
  emptyState: {
    title: string;
    description: string;
    action: string;
  };
}

export const ProfileGroupsFeed = ({ onEmptyAction, emptyState }: ProfileGroupsFeedProps) => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserGroups();
  }, []);

  const fetchUserGroups = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get groups the user is a member of
      const { data: memberGroups, error } = await supabase
        .from('group_members')
        .select(`
          group_id,
          groups (
            id,
            name,
            description,
            avatar_url,
            visibility,
            creator_id
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching groups:', error);
        return;
      }

      // Get member counts for each group
      const groupsWithCounts = await Promise.all(
        (memberGroups || []).map(async (mg) => {
          const group = mg.groups as any;
          if (!group) return null;

          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          return {
            id: group.id,
            name: group.name,
            description: group.description,
            avatar_url: group.avatar_url,
            visibility: group.visibility,
            member_count: count || 0,
            is_creator: group.creator_id === user.id
          };
        })
      );

      setGroups(groupsWithCounts.filter(Boolean) as Group[]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="col-span-3 py-12 text-center">
        <p className="text-sm text-muted-foreground">Loading groups...</p>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="col-span-3 py-12 text-center flex flex-col items-center gap-4">
        <Users className="w-12 h-12 text-muted-foreground/50" />
        <div>
          <p className="font-medium text-foreground">{emptyState.title}</p>
          <p className="text-sm text-muted-foreground mt-1">{emptyState.description}</p>
        </div>
        <Button onClick={onEmptyAction} className="mt-2">
          <Plus size={16} className="mr-2" />
          {emptyState.action}
        </Button>
      </div>
    );
  }

  return (
    <div className="col-span-3 space-y-3">
      {groups.map((group) => (
        <div
          key={group.id}
          onClick={() => navigate(`/messages?group=${group.id}`)}
          className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <Avatar className="w-12 h-12">
            <AvatarImage src={group.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary">
              <Users size={20} />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">{group.name}</h3>
              {group.is_creator && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  Creator
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {group.visibility === 'public' ? (
                <Globe size={12} />
              ) : (
                <Lock size={12} />
              )}
              <span>{group.member_count} member{group.member_count !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
