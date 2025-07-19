'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Upload, X, FileText, Clock, MapPin, Banknote, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
// import { useSearchParams } from 'next/navigation';
import { UploadButton } from '@/utils/uploadthing';
import Image from 'next/image';
import { useParams } from 'next/navigation';

interface StudentData {
  name: string;
  email: string;
  phone: string | null;
}

interface FormData {
  phone: string;
  fatherName: string;
  permanentAddress: string;
  resumeUrl: string | null;
}

export default function InternshipAcceptPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [linkExpired, setLinkExpired] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    phone: '',
    fatherName: '',
    permanentAddress: '',
    resumeUrl: null
  });
  const [resumeError, setResumeError] = useState<string | null>(null);

  const Params = useParams();
  const token = typeof Params === 'object' && Params !== null ? (Params as Record<string, string>)['token'] : undefined;

  useEffect(() => {
    if (!token) {
      setError('Invalid access link');
      setLoading(false);
      return;
    }

    fetchStudentData();
  }, [token]);

  const fetchStudentData = async () => {
    try {
      const response = await fetch(`/api/internship/verify-token?token=${token}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 410) {
          setLinkExpired(true);
        } else {
          setError(data.error || 'Invalid or expired link');
        }
        return;
      }

      setStudentData(data.student);
      setFormData(prev => ({
        ...prev,
        phone: data.student.phone || ''
      }));
    } catch (error) {
      setError('Failed to verify link');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!formData.phone.trim()) {
      setError('Phone number is required');
      setSubmitting(false);
      return;
    }

    if (!formData.fatherName.trim()) {
      setError('Father\'s name is required');
      setSubmitting(false);
      return;
    }

    if (!formData.permanentAddress.trim()) {
      setError('Permanent address is required');
      setSubmitting(false);
      return;
    }

    if (!formData.resumeUrl) {
      setError('Resume is required');
      setSubmitting(false);
      return;
    }

    try {
      const acceptanceResponse = await fetch('/api/internship/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          phone: formData.phone,
          fatherName: formData.fatherName,
          permanentAddress: formData.permanentAddress,
          resumeUrl: formData.resumeUrl,
        }),
      });

      if (!acceptanceResponse.ok) {
        const errorData = await acceptanceResponse.json();
        throw new Error(errorData.error || 'Failed to submit acceptance');
      }

      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit acceptance');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (linkExpired) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center">
              <Clock className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Link Expired</CardTitle>
            <CardDescription>
              This internship acceptance link has expired. Please contact our HR team for assistance.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Contact us at: <a href="mailto:hr@gennext.com" className="text-blue-600 hover:underline">hr@gennext.com</a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !studentData) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Invalid Link</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Application Submitted!</CardTitle>
            <CardDescription>
              Thank you for accepting our internship offer. We'll contact you soon with further details.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600">
              You can now close this window.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 w-full">
          {/* Left Side - Internship Details */}
          <div className="w-full lg:w-1/2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="inline-flex items-center justify-center   rounded-full">
                    <Image src="/Gennextlogoxdarkblue.jpg" alt="GenNext Logo" width={96} height={96} />
                  </div>
                  <div>
                    {/* <h1 className="text-2xl font-bold text-gray-900">GenNext</h1> */}
                    <p className="text-sm text-gray-600">Internship Program</p>
                  </div>
                </div>
                <CardTitle className="text-xl">Internship Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-semibold">2 months</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Start Date</p>
                        <p className="font-semibold">1st August 2025</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Format</p>
                        <p className="font-semibold">Offline</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Banknote className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Stipend</p>
                        <p className="font-semibold">₹2,000 per month</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-3">Office Location</h3>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-semibold">GenNext Technologies</p>
                          <p className="text-sm text-gray-600">Sector 62, Noida</p>
                          <p className="text-sm text-gray-600">Uttar Pradesh, India</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Acceptance Form */}
          <div className="w-full lg:w-1/2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Complete Your Application</CardTitle>
                <CardDescription>
                  Welcome {studentData?.name}! Please fill in the required details to accept your internship offer.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          type="text"
                          value={studentData?.name || ''}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={studentData?.email || ''}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="fatherName">Father's Name *</Label>
                      <Input
                        id="fatherName"
                        type="text"
                        placeholder="Enter your father's name"
                        value={formData.fatherName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fatherName: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="permanentAddress">Permanent Address *</Label>
                      <Textarea
                        id="permanentAddress"
                        placeholder="Enter your permanent address"
                        value={formData.permanentAddress}
                        onChange={(e) => setFormData(prev => ({ ...prev, permanentAddress: e.target.value }))}
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <Label>Upload Resume (PDF only, max 4MB) *</Label>
                      <div className="mt-2">
                        <UploadButton
                          endpoint="docUploader"
                          appearance={{
                            button: "bg-blue-600 hover:bg-blue-700 text-white w-full",
                            allowedContent: "text-xs text-gray-500",
                          }}
                          onClientUploadComplete={(res) => {
                            if (res && res.length > 0) {
                              const fileUrl = res[0].url;
                              setFormData(prev => ({
                                ...prev,
                                resumeUrl: fileUrl,
                              }));
                              setResumeError(null);
                            }
                          }}
                          onUploadError={(error: Error) => {
                            setResumeError(error.message);
                            console.error("Error uploading resume:", error);
                          }}
                        />
                        {formData.resumeUrl && (
                          <div className="mt-2 flex items-center text-sm text-green-600">
                            <FileText className="w-4 h-4 mr-1" />
                            Resume uploaded successfully
                          </div>
                        )}
                        {resumeError && (
                          <p className="mt-1 text-sm text-red-600">{resumeError}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <X className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-6 text-lg"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Accept Internship Offer
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 GenNext Technologies. All rights reserved.</p>
          <p className="mt-1">This link expires in 2 days from the date of email sent.</p>
        </div>
      </div>
    </div>
  );
}