// NodeBase.js

import React from 'react';
import { motion } from 'framer-motion';

export const NodeBase = ({ title, icon = null, children }) => {
  return (
    <motion.div
      style={styles.container}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <div style={styles.header}>
        <div style={styles.icon}>{icon}</div>
        <div style={styles.title}>{title}</div>
      </div>
      <div style={styles.body}>{children}</div>
    </motion.div>
  );
};

const styles = {
  container: {
    minWidth: 220,
    maxWidth: 360,
    borderRadius: 12,
    border: '1px solid #233043',
    background: 'linear-gradient(180deg, #0F172A 0%, #111827 100%)',
    color: '#E5E7EB',
    boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    background: 'rgba(30,41,59,0.9)',
    borderBottom: '1px solid #1F2937',
  },
  icon: {
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#334155',
    color: '#fff',
    borderRadius: 6,
    fontSize: 12,
  },
  title: {
    fontWeight: 600,
    letterSpacing: 0.3,
  },
  body: {
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
};
