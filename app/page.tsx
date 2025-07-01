'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AuthModal from '@/components/AuthModal';

// Data structures for reusable content
const features = [
  { icon: "📝", title: "Create Profile", description: "Add medical info: blood type, allergies, conditions, medications, and emergency contacts.", step: "01" },
  { icon: "📱", title: "Get QR Code", description: "Receive a unique QR code linking to your emergency medical information. Print or save on phone.", step: "02" },
  { icon: "🚨", title: "Emergency Access", description: "Anyone can scan your QR code to access medical info and alert your emergency contacts.", step: "03" }
];

const benefits = [
  { icon: "⚡", title: "Instant Access", description: "No login required for emergency access. Critical information in seconds." },
  { icon: "🔒", title: "Secure & Private", description: "Your data is encrypted and only accessible via your unique QR code." },
  { icon: "📱", title: "Mobile-First", description: "Optimized for mobile devices and works offline after initial load." },
  { icon: "🚑", title: "Emergency Alerts", description: "One-click SOS alerts to all emergency contacts with location." },
  { icon: "🌍", title: "Location Sharing", description: "Automatic location sharing in emergency alerts for faster response." },
  { icon: "✨", title: "Easy to Use", description: "Simple setup process and intuitive interface for all ages." }
];

const stats = [
  { number: "10K+", label: "Lives Protected", icon: "🛡️" },
  { number: "99.9%", label: "Uptime", icon: "⚡" },
  { number: "<3s", label: "Access Time", icon: "⏱️" },
  { number: "24/7", label: "Available", icon: "🌐" }
];

const testimonials = [
  { name: "Dr. Sarah Chen", role: "Emergency Physician", text: "MedGuard has revolutionized how we access patient information in critical situations.", avatar: "👩‍⚕️" },
  { name: "Mark Johnson", role: "Paramedic", text: "Having instant access to medical history saves precious time during emergencies.", avatar: "🚑" },
  { name: "Lisa Williams", role: "Patient", text: "Peace of mind knowing my family can be contacted instantly if something happens.", avatar: "👩" }
];

export default function HomePage() {
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' as 'login' | 'register' });
  const searchParams = useSearchParams();

  // Auto-open login modal if showLogin=true in URL (after logout)
  useEffect(() => {
    const showLogin = searchParams.get('showLogin');
    if (showLogin === 'true') {
      setAuthModal({ isOpen: true, mode: 'login' });
      // Clean up the URL parameter
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams]);

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthModal({ isOpen: true, mode });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'login' });
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-soft sticky top-0 z-50">
        <div className="container-width">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">🛡️</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">MedGuard</span>
            </div>
            <div className="flex items-center space-x-6">
              <button onClick={() => openAuthModal('login')} className="nav-link">Sign In</button>
              <button onClick={() => openAuthModal('register')} className="btn-primary">Get Started</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="container-width">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fadeIn">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span>Emergency Ready Platform</span>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                  Save Lives
                  <br />
                  <span className="text-gradient">Instantly</span> 🚨
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  QR codes for instant medical access. No login. No delays.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => openAuthModal('register')} className="btn-emergency group">
                  Create Profile
                  <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </button>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>⚡ 2s setup</span>
                  <span>🆓 Free forever</span>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              {/* Main QR Demo */}
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl border">
                <div className="text-center space-y-6">
                  <div className="w-40 h-40 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 mx-auto rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden">
                    <div className="absolute inset-2 bg-white rounded-lg p-4">
                      <div className="grid grid-cols-8 gap-1">
                        {Array.from({ length: 64 }, (_, i) => (
                          <div 
                            key={i} 
                            className={`w-2 h-2 rounded-sm ${
                              // Deterministic pattern for QR code demo
                              (i + Math.floor(i / 8)) % 3 === 0 ? 'bg-gray-900' : 'bg-white'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-900">Emergency QR Code</h3>
                    <div className="flex items-center justify-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="text-green-600 font-bold">2.3s</div>
                        <div className="text-gray-500">Scan Time</div>
                      </div>
                      <div className="w-px h-8 bg-gray-200"></div>
                      <div className="text-center">
                        <div className="text-blue-600 font-bold">24/7</div>
                        <div className="text-gray-500">Available</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Live indicators */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-red-100 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-2xl">🏥</span>
              </div>
              <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center animate-pulse-slow">
                <span className="text-xl">📱</span>
              </div>
              <div className="absolute top-1/2 -left-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-lg">🚑</span>
              </div>
              
              {/* Background decoration */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-red-100 to-orange-100 rounded-full opacity-30 blur-xl"></div>
                <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-30 blur-xl"></div>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-20 text-center">
            <p className="text-gray-500 text-sm mb-6">Trusted by emergency responders</p>
            <div className="flex items-center justify-center space-x-12 opacity-60">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🏥</span>
                <span className="font-medium text-gray-600">Hospitals</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🚑</span>
                <span className="font-medium text-gray-600">EMT Services</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">👨‍⚕️</span>
                <span className="font-medium text-gray-600">First Responders</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 via-red-700 to-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="container-width relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-white bg-opacity-20 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></span>
              <span>Live Platform Stats</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Saving Lives Every Day</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2 group">
                <div className="text-4xl md:text-6xl font-bold text-white transform group-hover:scale-110 transition-transform">{stat.number}</div>
                <div className="text-red-100 font-medium">{stat.label}</div>
                <div className="text-3xl transform group-hover:rotate-12 transition-transform">{stat.icon}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-bounce"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        <div className="container-width">
          {/* Enhanced Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-red-100 to-orange-100 text-red-600 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-sm">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
              <span>⚡ Emergency Ready in 3 Simple Steps</span>
              <span className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From setup to life-saving access in under 2 minutes. No technical knowledge required.
            </p>
          </div>
          
          {/* Enhanced Steps Container */}
          <div className="relative max-w-6xl mx-auto">
            {/* Animated Connection Line */}
            <div className="hidden lg:block absolute top-32 left-1/6 right-1/6 h-2 rounded-full overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-red-200 via-orange-200 to-green-200 opacity-30"></div>
              <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse"></div>
            </div>
            
                         {/* Enhanced Steps Grid */}
             <div className="grid lg:grid-cols-3 gap-12 relative">
               {features.map((feature, index) => (
                 <div key={index} className="relative group flex flex-col">
                   {/* Enhanced Step Circle with Glow Effect */}
                   <div className="flex justify-center mb-10">
                     <div className="relative">
                       {/* Glow Effect */}
                       <div className="absolute inset-0 w-28 h-28 bg-gradient-to-br from-red-400 to-orange-400 rounded-full opacity-20 animate-pulse group-hover:opacity-30 transition-opacity"></div>
                       
                       {/* Main Circle */}
                       <div className="relative w-24 h-24 bg-gradient-to-br from-red-500 via-red-600 to-orange-500 rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-3xl group-hover:scale-110 transition-all duration-300">
                         <span className="text-white text-4xl filter drop-shadow-lg">{feature.icon}</span>
                       </div>
                       
                       {/* Enhanced Step Number */}
                       <div className="absolute -top-4 -right-4 w-12 h-12 bg-white border-4 border-red-500 rounded-full flex items-center justify-center shadow-lg group-hover:border-orange-500 transition-colors">
                         <span className="text-red-500 text-lg font-bold group-hover:text-orange-500">{feature.step}</span>
                       </div>
                       
                       {/* Floating Elements */}
                       <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full animate-bounce opacity-60"></div>
                       <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse opacity-60"></div>
                     </div>
                   </div>
                   
                   {/* Enhanced Content Card - Equal Heights */}
                   <div className="bg-white rounded-3xl p-8 shadow-xl group-hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:border-gray-200 h-[580px] flex flex-col">
                     <div className="text-center space-y-6 flex-1 flex flex-col">
                       <h3 className="text-3xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">{feature.title}</h3>
                       <p className="text-gray-600 leading-relaxed text-lg">{feature.description}</p>
                       
                       {/* Enhanced Interactive Demo - Fixed Height */}
                       <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 mt-8 group-hover:from-red-50 group-hover:to-orange-50 transition-all duration-300 flex-1 flex flex-col justify-center h-[280px]">
                        {index === 0 && (
                          <div className="space-y-4">
                            <div className="text-sm text-gray-500 font-medium mb-4">Medical Profile Preview</div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                                <div className="flex items-center space-x-3">
                                  <span className="text-blue-500">👤</span>
                                  <span className="text-gray-700 font-medium">Full Name</span>
                                </div>
                                <div className="w-20 h-2 bg-gray-200 rounded animate-pulse"></div>
                              </div>
                              <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                                <div className="flex items-center space-x-3">
                                  <span className="text-red-500">🩸</span>
                                  <span className="text-gray-700 font-medium">Blood Type</span>
                                </div>
                                <span className="text-red-600 font-bold">O+</span>
                              </div>
                              <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                                <div className="flex items-center space-x-3">
                                  <span className="text-green-500">💊</span>
                                  <span className="text-gray-700 font-medium">Medications</span>
                                </div>
                                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">3 items</span>
                              </div>
                            </div>
                          </div>
                        )}
                        {index === 1 && (
                          <div className="space-y-4">
                            <div className="text-sm text-gray-500 font-medium mb-4">QR Code Generation</div>
                            <div className="relative w-24 h-24 bg-gray-900 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-105 transition-transform">
                              <div className="w-20 h-20 bg-white rounded-lg p-2">
                                <div className="grid grid-cols-6 gap-1">
                                  {Array.from({ length: 36 }, (_, i) => (
                                    <div key={i} className={`w-1 h-1 ${
                                      // Deterministic pattern for smaller QR demo
                                      (i * 3 + Math.floor(i / 6)) % 4 < 2 ? 'bg-gray-900' : 'bg-white'
                                    } transition-all duration-1000`} />
                                  ))}
                                </div>
                              </div>
                              {/* Scanning animation */}
                              <div className="absolute inset-0 border-2 border-red-500 rounded-2xl animate-pulse"></div>
                            </div>
                            <div className="flex items-center justify-center space-x-4 text-sm">
                              <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full font-medium">✓ Unique</span>
                              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-medium">🔒 Secure</span>
                            </div>
                          </div>
                        )}
                                                {index === 2 && (
                          <div className="space-y-6">
                            <div className="text-sm text-gray-500 font-medium text-center">Emergency Response</div>
                            <div className="flex items-center justify-center space-x-4">
                              <div className="text-center">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                  <span className="text-green-600">📱</span>
                                </div>
                                <div className="text-green-600 font-bold text-xs">Scan</div>
                              </div>
                              <div className="flex-1 h-0.5 bg-gradient-to-r from-green-400 to-red-400 rounded-full relative">
                                <div className="absolute w-2 h-2 bg-red-500 rounded-full -top-0.5 right-0 animate-pulse"></div>
                              </div>
                              <div className="text-center">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-2">
                                  <span className="text-red-600">🚨</span>
                                </div>
                                <div className="text-red-600 font-bold text-xs">Alert</div>
                              </div>
                            </div>
                            <div className="bg-white rounded-lg p-2 text-center border">
                              <span className="text-green-600 font-bold text-sm">2.3 seconds</span>
                              <div className="text-xs text-gray-400">Response Time</div>
                            </div>
                          </div>
                        )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Step Completion Indicator */}
                    <div className="flex justify-center mt-6">
                      <div className="bg-gradient-to-r from-green-400 to-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg transform group-hover:scale-105 transition-transform">
                        ✓ {index === 0 ? '30 seconds' : index === 1 ? '60 seconds' : 'Instant'}
                      </div>
                    </div>
                  </div>
              ))}
            </div>
            
            {/* Enhanced CTA at bottom */}
            <div className="text-center mt-20">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Protected?</h3>
                <p className="text-gray-600 mb-6">Join thousands who trust MedGuard for emergency preparedness</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={() => openAuthModal('register')} className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all cursor-pointer">
                    Start Free Setup →
                  </button>
                  <div className="text-gray-500 px-8 py-3 font-medium hover:text-gray-700 transition-colors cursor-pointer">
                    Learn More
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Background Elements */}
        <div className="absolute top-10 right-10 w-80 h-80 bg-gradient-to-br from-red-100 to-orange-100 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full opacity-10 blur-3xl"></div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative">
        <div className="container-width">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span>⭐</span>
              <span>Why We&apos;re Different</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Built for Real Emergencies</h2>
          </div>
          
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
            <div className="lg:col-span-2 lg:row-span-2 bg-white rounded-2xl p-8 shadow-lg group hover:shadow-xl transition-all">
              <div className="h-full flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-white text-3xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Instant Access</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">No login required for emergency access. Critical information in seconds.</p>
                  </div>
                </div>
                <div className="mt-8 bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">2.3s</div>
                      <div className="text-sm text-gray-500">Access Time</div>
                    </div>
                    <div className="text-4xl">⚡</div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">0</div>
                      <div className="text-sm text-gray-500">Login Steps</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {benefits.slice(1, 5).map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg group hover:shadow-xl transition-all">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <span className="text-2xl">{benefit.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
            

          </div>
        </div>
        
        <div className="absolute top-10 left-10 w-24 h-24 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-bounce"></div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="container-width">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span>💬</span>
              <span>Hero Testimonials</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Trusted by Life-Savers</h2>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg group-hover:shadow-2xl transition-all transform group-hover:-translate-y-2 h-[320px] flex flex-col">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-red-600 font-medium text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  
                  <div className="relative flex-1 flex flex-col justify-center">
                    <div className="text-4xl text-gray-200 absolute -top-2 -left-2">&quot;</div>
                    <p className="text-gray-700 leading-relaxed italic pl-6">{testimonial.text}</p>
                    <div className="text-4xl text-gray-200 absolute -bottom-2 -right-2">&quot;</div>
                  </div>
                  
                  <div className="flex items-center mt-6 space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">⭐</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">200+</div>
              <div className="text-gray-600 text-sm">Hospitals</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-600">500+</div>
              <div className="text-gray-600 text-sm">EMT Teams</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-red-600">1K+</div>
              <div className="text-gray-600 text-sm">First Responders</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-600">98%</div>
              <div className="text-gray-600 text-sm">Satisfaction</div>
            </div>
          </div>
        </div>
        
        <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-30 blur-2xl"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-gradient-to-br from-green-100 to-teal-100 rounded-full opacity-30 blur-2xl"></div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-red-600 via-red-700 to-orange-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="container-width relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-white bg-opacity-20 text-white px-4 py-2 rounded-full text-sm font-medium">
                  <span>🚀</span>
                  <span>Join the Community</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  Your Life
                  <br />
                  <span className="text-yellow-200">Protected</span> ✨
                </h2>
                <p className="text-xl text-red-100 leading-relaxed">
                  Join 10,000+ users who trust MedGuard for emergency preparedness
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => openAuthModal('register')} className="btn-emergency bg-white text-red-600 hover:bg-gray-50 group">
                  Start Free
                  <span className="ml-2 transition-transform group-hover:translate-x-1">🚀</span>
                </button>
                <button onClick={() => openAuthModal('login')} className="inline-flex items-center text-red-100 hover:text-white font-medium">
                  Already protected? Sign in →
                </button>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <span>✅</span>
                  <span className="text-red-100">Free Forever</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>✅</span>
                  <span className="text-red-100">2min Setup</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>✅</span>
                  <span className="text-red-100">24/7 Access</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white bg-opacity-10 rounded-3xl p-8 backdrop-blur-sm">
                <div className="text-center space-y-6">
                  <h3 className="text-2xl font-bold text-white mb-6">Ready in Minutes</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 text-left">
                      <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-sm font-bold text-gray-900">1</div>
                      <span className="text-white">Create account</span>
                      <div className="flex-1 text-right text-green-300 text-sm">30s</div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-left">
                      <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-sm font-bold text-gray-900">2</div>
                      <span className="text-white">Add medical info</span>
                      <div className="flex-1 text-right text-blue-300 text-sm">60s</div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-left">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-gray-900">3</div>
                      <span className="text-white">Get QR code</span>
                      <div className="flex-1 text-right text-yellow-300 text-sm">Instant</div>
                    </div>
                  </div>
                  
                  <div className="border-t border-white border-opacity-20 pt-6 mt-6">
                    <div className="text-3xl font-bold text-white">&lt; 2 minutes</div>
                    <div className="text-red-200 text-sm">to complete setup</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-xl">🛡️</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute top-10 left-10 w-32 h-32 bg-white bg-opacity-5 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-white bg-opacity-5 rounded-full animate-bounce"></div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white relative overflow-hidden">
        <div className="container-width">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">🛡️</span>
              </div>
              <div>
                <span className="text-2xl font-bold">MedGuard</span>
                <p className="text-gray-400 text-sm">Emergency Health Platform</p>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-6 text-sm">
                <span className="text-green-400">✅ 10K+ Protected</span>
                <span className="text-blue-400">⚡ 99.9% Uptime</span>
              </div>
              <p className="text-gray-400 text-sm">Saving lives through instant medical access</p>
            </div>
            
            <div className="text-center md:text-right">
              <button onClick={() => openAuthModal('register')} className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl">
                Get Protected →
              </button>
            </div>
          </div>
          
          <div className="pt-8 mt-8 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-500">
              © 2024 MedGuard. Built for emergency preparedness. 🚑
            </p>
          </div>
        </div>
        
        <div className="absolute top-10 right-10 w-20 h-20 bg-red-500 bg-opacity-10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-16 h-16 bg-blue-500 bg-opacity-10 rounded-full animate-bounce"></div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={closeAuthModal} 
        initialMode={authModal.mode} 
      />
    </div>
  );
}
