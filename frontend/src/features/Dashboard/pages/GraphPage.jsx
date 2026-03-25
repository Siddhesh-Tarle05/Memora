import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';

import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SaveModal from '../components/SaveModal';
import { getGraphData } from '../services/notes.api';
import { useNotes } from '../hooks/useNotes';

import '../styles/GraphPage.scss';
import '../styles/Dashboard.scss'; // for layout root

const GraphPage = () => {
  const user = useSelector((s) => s.auth.user);
  const { searchQuery, handleSearch, handleSaveNote } = useNotes();
  const graphRef = useRef();

  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Sidebar width varies by breakpoint; approximate for graph sizing
  const sidebarW = window.innerWidth <= 768 ? 0 : window.innerWidth <= 1024 ? 64 : 220;
  // Dimensions for fullscreen graph
  const [dimensions, setDimensions] = useState({ width: window.innerWidth - sidebarW, height: window.innerHeight - 80 });

  useEffect(() => {
    const handleResize = () => {
      const sw = window.innerWidth <= 768 ? 0 : window.innerWidth <= 1024 ? 64 : 220;
      setDimensions({ width: window.innerWidth - sw, height: window.innerHeight - 80 });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadGraph();
  }, []);

  async function loadGraph() {
    setLoading(true);
    try {
      const data = await getGraphData();
      setGraphData(data);
    } catch (e) {
      console.error(e);
      setError('Failed to load semantic graph relationships.');
    } finally {
      setLoading(false);
    }
  }

  // Visuals computation
  const getNodeColor = (node) => {
    if (node.type === 'topic') return '#f59e0b'; // Amber
    if (node.type === 'tag') return '#ec4899'; // Pink
    return '#6d28d9'; // Standard purple for Notes
  };

  const handleSave = async (data) => {
    setIsSaving(true);
    try { 
      await handleSaveNote(data); 
      setShowModal(false);
      loadGraph(); // refresh graph after saving!
    } finally { 
      setIsSaving(false); 
    }
  };

  return (
    <div className="dashboard-root">
      <Sidebar
        onSaveClick={() => setShowModal(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="dashboard-main" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <div className="dashboard-content" style={{ padding: 0, flex: 1, position: 'relative' }}>
          
          <div className="graph-page-container">
            <div className="graph-header">
              <h1>Knowledge Graph</h1>
              <p>Explore the semantic connections between your thoughts.</p>
            </div>

            {loading ? (
              <div className="graph-loading">
                <div className="spinner" />
                <p>Calculating semantic vectors...</p>
              </div>
            ) : error ? (
              <div className="graph-loading" style={{ color: '#ef4444' }}>
                <p>{error}</p>
                <button onClick={loadGraph} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#333', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>Retry</button>
              </div>
            ) : (
              <div className="graph-canvas-wrapper">
                <ForceGraph3D
                  ref={graphRef}
                  width={dimensions.width}
                  height={dimensions.height}
                  graphData={graphData}
                  nodeLabel="name"
                  nodeColor={getNodeColor}
                  nodeVal="val"
                  nodeResolution={16}
                  linkColor={link => link.type === 'semantic' ? "rgba(109, 40, 217, 0.4)" : "rgba(161, 161, 170, 0.2)"}
                  linkOpacity={0.8}
                  linkWidth={link => link.type === 'semantic' ? 1.5 : 0.5}
                  linkDirectionalParticles={link => link.type === 'semantic' ? 2 : 0}
                  linkDirectionalParticleSpeed={d => d.strength * 0.01}
                  backgroundColor="#050505"
                  enableNodeDrag={false}
                  onNodeClick={node => {
                    // Zoom towards node on click
                    const distance = 40;
                    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
                    graphRef.current.cameraPosition(
                      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, 
                      node, 
                      3000 // ms transition
                    );
                  }}
                />
              </div>
            )}
          </div>

        </div>
      </div>

      {showModal && (
        <SaveModal onClose={() => setShowModal(false)} onSave={handleSave} isSaving={isSaving} />
      )}
    </div>
  );
};

export default GraphPage;
