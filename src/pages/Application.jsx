import React from 'react';
import { Card } from '../components/ui/Card';
import PersonalInformation from '../components/application/PersonalInformation';
import CorrespondenceDetails from '../components/application/CorrespondenceDetails';
import ProfessionalDetails from '../components/application/ProfessionalDetails';

const Application = () => {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Application</h1>
      
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <PersonalInformation />
      </Card>

      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Correspondence Details</h2>
        <CorrespondenceDetails />
      </Card>

      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Professional Details</h2>
        <ProfessionalDetails />
      </Card>
    </div>
  );
};

export default Application; 