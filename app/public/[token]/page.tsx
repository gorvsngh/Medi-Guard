import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import connectDB from '@/lib/db';
import User from '@/models/User';

interface PublicPageProps {
  params: Promise<{
    token: string;
  }>;
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
  const { token } = await params;
  const user = await getUserByToken(token);
  
  if (!user) {
    return {
      title: 'Emergency Profile Not Found - MedGuard',
      description: 'The requested emergency profile could not be found.',
    };
  }

  return {
    title: `${user.name} - Emergency Medical Information`,
    description: `Emergency medical profile for ${user.name}. Critical medical information for first responders.`,
    robots: 'noindex, nofollow',
  };
}

export default async function PublicEmergencyPage({ params }: PublicPageProps) {
  const { token } = await params;
  const user = await getUserByToken(token);

  if (!user) {
    notFound();
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; 
            background-color: #ffffff; 
            padding: 20px;
            line-height: 1.5;
            color: #374151;
          }
          .container { max-width: 600px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; }
          .title { color: #111827; font-size: 28px; margin-bottom: 8px; font-weight: 600; }
          .subtitle { color: #6b7280; font-size: 16px; font-weight: 400; }
          .emergency-btn { 
            display: block; 
            background-color: #dc2626; 
            color: white; 
            padding: 16px; 
            text-align: center; 
            text-decoration: none; 
            border-radius: 8px; 
            font-size: 18px; 
            font-weight: 500; 
            margin-bottom: 40px;
            border: none;
          }
          .card { 
            background-color: #ffffff; 
            padding: 24px; 
            border-radius: 8px; 
            margin-bottom: 24px; 
            border: 1px solid #e5e7eb; 
          }
          .card-title { color: #111827; margin-bottom: 16px; font-size: 18px; font-weight: 600; }
          .allergies { border-left: 4px solid #dc2626; }
          .allergies .card-title { color: #dc2626; }
          .allergies p { color: #374151; font-weight: 500; }
          .conditions { border-left: 4px solid #d97706; }
          .conditions .card-title { color: #d97706; }
          .conditions p { color: #374151; }
          .medications { border-left: 4px solid #2563eb; }
          .medications .card-title { color: #2563eb; }
          .medications p { color: #374151; }
          .contact { 
            margin-bottom: 16px; 
            padding: 16px; 
            background-color: #f9fafb; 
            border-radius: 6px; 
            border: 1px solid #e5e7eb;
          }
          .contact-btn { 
            display: inline-block; 
            background-color: #374151; 
            color: white; 
            padding: 8px 16px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin-top: 8px; 
            font-size: 14px;
            font-weight: 500;
          }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          .footer p { color: #9ca3af; font-size: 14px; margin-bottom: 4px; }
          .item { margin-bottom: 8px; }
        `
      }} />
      <div className="container">
          <div className="header">
            <h1 className="title">Emergency Medical Information</h1>
            <p className="subtitle">Critical information for first responders</p>
          </div>

          <a href="tel:911" className="emergency-btn">
            Call Emergency Services
          </a>

          <div className="card">
            <h2 className="card-title">Patient Information</h2>
            <div className="item"><strong>Name:</strong> {user.name}</div>
            {user.bloodType && <div className="item"><strong>Blood Type:</strong> {user.bloodType}</div>}
          </div>

          {user.allergies && user.allergies.length > 0 && (
            <div className="card allergies">
              <h3 className="card-title">Allergies</h3>
              {user.allergies.map((allergy: string, index: number) => (
                <div key={index} className="item">• {allergy}</div>
              ))}
            </div>
          )}

          {user.conditions && user.conditions.length > 0 && (
            <div className="card conditions">
              <h3 className="card-title">Medical Conditions</h3>
              {user.conditions.map((condition: string, index: number) => (
                <div key={index} className="item">• {condition}</div>
              ))}
            </div>
          )}

          {user.medications && user.medications.length > 0 && (
            <div className="card medications">
              <h3 className="card-title">Current Medications</h3>
              {user.medications.map((medication: string, index: number) => (
                <div key={index} className="item">• {medication}</div>
              ))}
            </div>
          )}

          {user.emergencyContacts && user.emergencyContacts.length > 0 && (
            <div className="card">
              <h2 className="card-title">Emergency Contacts</h2>
              {user.emergencyContacts.map((contact: any, index: number) => (
                <div key={index} className="contact">
                  <div><strong>{contact.name}</strong> - {contact.relationship}</div>
                  <a href={`tel:${contact.phone}`} className="contact-btn">
                    Call {contact.phone}
                  </a>
                </div>
              ))}
            </div>
          )}

                    <div className="footer">
            <p>MedGuard</p>
          </div>
        </div>
      </>
    );
  } 