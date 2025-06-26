import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import connectDB from '@/lib/db';
import User from '@/models/User';
import EmergencyPage from '@/components/EmergencyPage';

interface PublicPageProps {
  params: {
    token: string;
  };
}

async function getUserByToken(token: string) {
  try {
    await connectDB();
    const user = await User.findOne({ 
      publicToken: token,
      isActive: true 
    }).select('-passwordHash -email');
    
    return user;
  } catch (error) {
    console.error('Error fetching user by token:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PublicPageProps): Promise<Metadata> {
  const user = await getUserByToken(params.token);
  
  if (!user) {
    return {
      title: 'Emergency Profile Not Found - MedGuard',
      description: 'The requested emergency profile could not be found.',
    };
  }

  return {
    title: `${user.name} - Emergency Medical Information`,
    description: `Emergency medical profile for ${user.name}. Critical medical information for first responders.`,
    robots: 'noindex, nofollow', // Prevent search engine indexing
  };
}

export default async function PublicEmergencyPage({ params }: PublicPageProps) {
  const user = await getUserByToken(params.token);

  if (!user) {
    notFound();
  }

  // Transform user data for the client component
  const emergencyData = {
    id: user._id.toString(),
    name: user.name,
    bloodType: user.bloodType,
    allergies: user.allergies || [],
    conditions: user.conditions || [],
    medications: user.medications || [],
    emergencyContacts: user.emergencyContacts || [],
    publicToken: user.publicToken,
  };

  return <EmergencyPage user={emergencyData} />;
}

// Enable static generation for faster loading
export const revalidate = 3600; // Revalidate every hour 