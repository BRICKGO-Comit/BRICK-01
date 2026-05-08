"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Department = 'all' | 'brick_core' | 'brick_food';

interface DepartmentContextType {
    department: Department;
    setDepartment: (dept: Department) => void;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

export function DepartmentProvider({ children }: { children: React.ReactNode }) {
    const [department, setDepartmentState] = useState<Department>('all');

    // Load from localStorage on mount
    useEffect(() => {
        const savedDept = localStorage.getItem('admin_selected_department') as Department;
        if (savedDept && ['all', 'brick_core', 'brick_food'].includes(savedDept)) {
            setDepartmentState(savedDept);
        }
    }, []);

    const setDepartment = (dept: Department) => {
        setDepartmentState(dept);
        localStorage.setItem('admin_selected_department', dept);
    };

    return (
        <DepartmentContext.Provider value={{ department, setDepartment }}>
            {children}
        </DepartmentContext.Provider>
    );
}

export function useDepartment() {
    const context = useContext(DepartmentContext);
    if (context === undefined) {
        throw new Error('useDepartment must be used within a DepartmentProvider');
    }
    return context;
}
