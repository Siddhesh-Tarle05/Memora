import React from 'react';
import ArticleCard from './ArticleCard';
import VideoCard from './VideoCard';
import TweetCard from './TweetCard';
import ImageCard from './ImageCard';
import PdfCard from './PdfCard';

const NoteCardFactory = ({ note }) => {
  switch (note.type) {
    case 'video':
    case 'youtube':
      return <VideoCard note={note} />;
    case 'twitte':
      return <TweetCard note={note} />;
    case 'image':
      return <ImageCard note={note} />;
    case 'pdf':
      return <PdfCard note={note} />;
    case 'web':
    default:
      return <ArticleCard note={note} />;
  }
};

export default NoteCardFactory;
