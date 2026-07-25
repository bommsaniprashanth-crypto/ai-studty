import { useState } from 'react';
import { Film, Palette, Image, Video, Wand2, Play } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  hours?: number;
  projects?: number;
  total: number;
  icon: any;
  color: string;
}

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([
    { id: '1', name: 'Premiere Pro', hours: 0, total: 20, icon: <Film className="w-6 h-6" />, color: '#9333ea' },
    { id: '2', name: 'After Effects', hours: 0, total: 20, icon: <Play className="w-6 h-6" />, color: '#7c3aed' },
    { id: '3', name: 'Canva', hours: 0, total: 20, icon: <Palette className="w-6 h-6" />, color: '#a855f7' },
    { id: '4', name: 'Figma', hours: 0, total: 20, icon: <Wand2 className="w-6 h-6" />, color: '#c026d3' },
    { id: '5', name: 'Thumbnails', projects: 0, total: 30, icon: <Image className="w-6 h-6" />, color: '#d946ef' },
    { id: '6', name: 'Reels Editing', projects: 0, total: 25, icon: <Video className="w-6 h-6" />, color: '#e879f9' },
  ]);

  const updateSkill = (id: string, updates: Partial<Skill>) => {
    setSkills(skills.map(skill => skill.id === id ? { ...skill, ...updates } : skill));
  };

  const addSkill = (skill: Omit<Skill, 'id'>) => {
    const newSkill: Skill = {
      ...skill,
      id: Date.now().toString(),
    };
    setSkills([...skills, newSkill]);
  };

  const resetSkillsProgress = () => {
    setSkills(skills.map(skill => ({
      ...skill,
      hours: skill.hours !== undefined ? 0 : skill.hours,
      projects: skill.projects !== undefined ? 0 : skill.projects,
    })));
  };

  const getSkillsStats = () => {
    const totalHours = skills.reduce((sum, skill) => sum + (skill.hours || 0), 0);
    const totalProjects = skills.reduce((sum, skill) => sum + (skill.projects || 0), 0);
    const skillsCompleted = skills.filter(skill => {
      const value = skill.hours || skill.projects || 0;
      return (value / skill.total) >= 1;
    }).length;

    return { totalHours, totalProjects, skillsCompleted };
  };

  return {
    skills,
    updateSkill,
    addSkill,
    resetSkillsProgress,
    getSkillsStats,
  };
}
