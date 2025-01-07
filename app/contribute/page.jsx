'use client';

import ContributeForm from '@/components/ContributeForm';
import ContributionsList from '@/components/ContributionsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { MessageSquarePlus, ListChecks, CheckCircle2, ShieldCheck } from "lucide-react";

export default function ContributePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Help Improve Translation Accuracy
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your contributions help make our Banglish-to-Bangla translations more accurate and natural.
            Each verified translation improves the overall quality of our service.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side: Guidelines */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-none">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Guidelines</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                      Ensure translations are accurate and natural
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                      Avoid using machine translations
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                      Use proper grammar and punctuation
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-none">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Process</h3>
                  <p className="text-gray-600">
                    All contributions are carefully reviewed by our team of experts before being added to 
                    the dataset. This ensures high-quality translations that benefit everyone.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Side: Form/History Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="contribute" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-[400px] mx-auto mb-6">
                <TabsTrigger value="contribute" className="flex items-center gap-2">
                  <MessageSquarePlus className="h-4 w-4" />
                  Submit Translation
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="contribute">
                <Card className="p-6">
                  <ContributeForm />
                </Card>
              </TabsContent>
              
              <TabsContent value="history">
                <Card className="p-6">
                  <ContributionsList />
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
