
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background paw-print-bg">
      <div className="text-center max-w-md p-6">
        <div className="w-24 h-24 bg-petpal-blue rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M8 12.5c1-1.3 2.5-2 4-2s3 .7 4 2"></path>
            <path d="M6 8.5c.5-.5 1.5-1 2.5-1s2 .5 2.5 1"></path>
            <path d="M13 7.5c.5-.5 1.5-1 2.5-1s2 .5 2.5 1"></path>
            <path d="M9 11.5c-1.5-1-2.5-3-2.5-3.5-.4.4-1 .5-1.5.5-1 0-2-.5-2.5-1-.6-.5-.6-3 1-3 0 0 1.2-.5 1.8.5C6 5 6 6 5.5 6.5c1 .5 2 1.5 3 2.5"></path>
            <path d="M19 11.5c1.5-1 2.5-3 2.5-3.5.4.4 1 .5 1.5.5 1 0 2-.5 2.5-1 .6-.5.6-3-1-3 0 0-1.2-.5-1.8.5C22 5 22 6 22.5 6.5c-1 .5-2 1.5-3 2.5"></path>
            <path d="M9 13.5c-1-.8-2-1.4-3-1.5-.6-.1-1.3 0-1.5.5-.4.7 0 1.1.5 1.5.5.2 1 .5 1.5.5s1-.2 1.5-.5C8.5 13.7 9 13.5 9 13.5z"></path>
            <path d="M15 13.5c1-.8 2-1.4 3-1.5.6-.1 1.3 0 1.5.5.4.7 0 1.1-.5 1.5-.5.2-1 .5-1.5.5s-1-.2-1.5-.5c-.5-.3-1-.5-1-.5z"></path>
            <path d="M12 20c-1 0-2-.8-2-1.5 0-.5.5-1 1-1.5.8-.7 2-1.5 4-1.5s3.2.8 4 1.5c.5.5 1 1 1 1.5 0 .7-1 1.5-2 1.5"></path>
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-2">Oops! Page Not Found</h1>
        <p className="text-xl text-muted-foreground mb-6">Looks like this page ran away to chase a squirrel!</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-petpal-blue hover:bg-petpal-blue/90">
            <Link to="/">Go Back Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/#profile">View My Pet Profiles</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
