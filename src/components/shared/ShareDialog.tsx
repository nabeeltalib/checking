import React, { useCallback } from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  FacebookIcon,
  XIcon,
  WhatsappIcon,
  LinkedinIcon,
} from "react-share";
import { X, Link } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useShareDialog } from './ShareDialogContext'; // Make sure this path is correct
const ShareDialog: React.FC = () => {
  const { isOpen, shareUrl, title, closeShareDialog } = useShareDialog();
  const { toast } = useToast();
  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "The list link has been copied to your clipboard.",
    });
  }, [shareUrl, toast]);
  if (!isOpen) return null;
  return (
    <div 
  style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    //backdropFilter: 'blur(1px)', // This adds a slight blur effect to the background
  }}
  onClick={closeShareDialog}
>
      <div 
        className="bg-gray-800 p-6 rounded-xl shadow-2xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Share this list</h3>
          <button
            onClick={closeShareDialog}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <ShareButton
            Button={FacebookShareButton}
            Icon={FacebookIcon}
            url={shareUrl}
            quote={title}
            label="Facebook"
          />
          <ShareButton
            Button={TwitterShareButton}
            Icon={XIcon}
            url={shareUrl}
            title={title}
            label="X"
          />
          <ShareButton
            Button={WhatsappShareButton}
            Icon={WhatsappIcon}
            url={shareUrl}
            title={title}
            label="WhatsApp"
          />
          <ShareButton
            Button={LinkedinShareButton}
            Icon={LinkedinIcon}
            url={shareUrl}
            title={title}
            label="LinkedIn"
          />
        </div>
        <div className="relative">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="w-full bg-gray-700 text-white px-4 py-2 pr-24 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCopyLink}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors flex items-center"
          >
            <Link size={16} className="mr-1" />
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};
interface ShareButtonProps {
  Button: React.ComponentType<any>;
  Icon: React.ComponentType<any>;
  url: string;
  quote?: string;
  title?: string;
  label: string;
}
const ShareButton: React.FC<ShareButtonProps> = ({ Button, Icon, url, quote, title, label }) => (
  <Button
    url={url}
    quote={quote}
    title={title}
    className="w-full"
  >
    <div className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 transition-colors rounded-lg py-2">
      <Icon size={32} round />
      <span className="ml-2 text-white">{label}</span>
    </div>
  </Button>
);
export default ShareDialog;