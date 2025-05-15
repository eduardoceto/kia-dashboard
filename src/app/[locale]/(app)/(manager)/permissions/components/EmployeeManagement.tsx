"use client"

import { useState, useEffect, useCallback } from "react"
import { Edit, Plus, Search, Trash, Loader2 } from "lucide-react"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Switch } from "@/src/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { toast } from "sonner"
import type { SupabaseClient } from '@supabase/supabase-js' // Import SupabaseClient type
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/src/components/ui/alert-dialog"

// Define Employee type
type Employee = {
  id: string; // This is the auth.users.id (UUID)
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string | null;
  is_active: boolean;
  employee_id: string; // This comes from the 'users' table
};

interface EmployeeManagementProps {
  supabase: SupabaseClient; // Accept Supabase client as a prop
}

export default function EmployeeManagement({ supabase }: EmployeeManagementProps) {
  // Employee State
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("")
  const [newEmployee, setNewEmployee] = useState({
    first_name: "",
    last_name: "",
    employee_id: "",
    email: "",
    password: "",
    role: "user", // Default role
    is_active: true,
  })
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false)
  const [isEditEmployeeDialogOpen, setIsEditEmployeeDialogOpen] = useState(false)
  const [isSubmittingEmployee, setIsSubmittingEmployee] = useState(false);
  const [pendingDeleteEmployee, setPendingDeleteEmployee] = useState<Employee | null>(null);
  const [pendingToggleEmployee, setPendingToggleEmployee] = useState<{id: string, currentStatus: boolean, first_name: string, last_name: string} | null>(null);

  // --- Fetch Function ---
  const fetchEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    // Fetch data from the 'users' table, which should contain profile info linked to auth.users
    // Ensure your 'users' table has an 'id' column that is a foreign key to 'auth.users.id'
    const { data, error } = await supabase
      .from('users') // Your profile table
      .select('id, employee_id, first_name, last_name, email, role, is_active'); // Select columns from your profile table

    if (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees.");
      setEmployees([]);
    } else {
      const formattedData = data?.map(emp => ({
        ...emp,
        id: emp.id, // Ensure 'id' from your 'users' table is selected
        email: emp.email ?? '', // Assuming email is also stored in 'users' table
        employee_id: emp.employee_id ?? '',
        first_name: emp.first_name ?? 'N/A',
        last_name: emp.last_name ?? 'N/A',
        full_name: emp.first_name && emp.last_name ? `${emp.first_name} ${emp.last_name}` : 'N/A',
        role: emp.role ?? 'N/A',
        is_active: emp.is_active ?? false
      })) || [];
      setEmployees(formattedData);
    }
    setLoadingEmployees(false);
  }, [supabase]);

  // Initial fetch
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // --- Filtered Data ---
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.first_name?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      employee.last_name?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      employee.employee_id?.toLowerCase().includes(employeeSearchTerm.toLowerCase()), // Added null check for employee_id
  );

  // --- Employee CRUD Operations ---

  const handleAddEmployee = async () => {
    if (!newEmployee.email || !newEmployee.password || !newEmployee.first_name || !newEmployee.last_name) {
      toast.error("Please fill in Email, Password, and Full Name.");
      return;
    }
    if (!newEmployee.email.includes("@kia.com")) {
      toast.error("Email must be a Kia email address (e.g., @kia.com).");
      return;
    }
    setIsSubmittingEmployee(true);

    try {
      // Call the secure API route instead of client-side signUp
      console.log("Creating new employee:", newEmployee);
      const response = await fetch("/api/admin-create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmployee),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to add employee.");
        return;
      }
      toast.success("Employee added successfully!");
      setNewEmployee({ first_name: "", last_name:"", employee_id: "", email: "", password: "", role: "user", is_active: true });
      setIsAddEmployeeDialogOpen(false);
      fetchEmployees();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("Error adding employee:", error);
      toast.error(`Failed to add employee: ${errMsg}`);
    } finally {
      setIsSubmittingEmployee(false);
    }
  };

  const handleEditEmployee = async () => {
    if (!editingEmployee) return;
    setIsSubmittingEmployee(true);

    try {
        // Update the user profile in the 'users' table
        const { error: updateError } = await supabase
            .from('users') // Your profile table
            .update({
                first_name: editingEmployee.first_name,
                last_name: editingEmployee.last_name,
                employee_id: editingEmployee.employee_id || null,
                role: editingEmployee.role,
                is_active: editingEmployee.is_active,
            })
            .eq('id', editingEmployee.id); 

        if (updateError) throw updateError;

        toast.success("Employee updated successfully!");
        setEditingEmployee(null);
        setIsEditEmployeeDialogOpen(false);
        fetchEmployees();
    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("Error updating employee:", error);
        toast.error(`Failed to update employee: ${errMsg}`);
    } finally {
        setIsSubmittingEmployee(false);
    }
  };

  // Deactivate (Soft Delete)
  const handleDeleteEmployee = (id: string) => {
      const employeeToDeactivate = employees.find(emp => emp.id === id);
      if (!employeeToDeactivate || !employeeToDeactivate.is_active) {
          toast.info("Employee is already inactive.");
          return;
      }
      setPendingDeleteEmployee(employeeToDeactivate);
  };

  const confirmDeleteEmployee = async () => {
      if (!pendingDeleteEmployee) return;
      setIsSubmittingEmployee(true);
      try {
          const { error } = await supabase
              .from('users')
              .update({ is_active: false })
              .eq('id', pendingDeleteEmployee.id);

          if (error) throw error;

          setEmployees(employees.map((emp) => (emp.id === pendingDeleteEmployee.id ? { ...emp, is_active: false } : emp)));
          toast.success("Employee deactivated successfully!");
      } catch (error: unknown) {
          const errMsg = error instanceof Error ? error.message : String(error);
          console.error("Error deactivating employee:", error);
          toast.error(`Failed to deactivate employee: ${errMsg}`);
      } finally {
          setIsSubmittingEmployee(false);
          setPendingDeleteEmployee(null);
      }
  };

  const handleToggleEmployeeActive = (id: string, currentStatus: boolean, first_name: string, last_name: string) => {
    setPendingToggleEmployee({ id, currentStatus, first_name, last_name });
  };

  const confirmToggleEmployeeActive = async () => {
    if (!pendingToggleEmployee) return;
    const { id, currentStatus } = pendingToggleEmployee;
    const action = currentStatus ? "deactivate" : "activate";
    setIsSubmittingEmployee(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      toast.success(`Employee ${action}d successfully!`);
      setEmployees(employees.map((emp) => (emp.id === id ? { ...emp, is_active: !currentStatus } : emp)));
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error toggling employee status (${action}):`, error);
      toast.error(`Failed to ${action} employee: ${errMsg}`);
    } finally {
      setIsSubmittingEmployee(false);
      setPendingToggleEmployee(null);
    }
  };

  // --- Render Logic ---
  return (
    <AccordionItem value="employees">
      <AccordionTrigger className="text-lg font-semibold">Employee Management</AccordionTrigger>
      <AccordionContent>
        {/* Search and Add Button */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees by name, email, or ID..."
              className="pl-8"
              value={employeeSearchTerm}
              onChange={(e) => setEmployeeSearchTerm(e.target.value)}
            />
          </div>
          {/* Add Employee Dialog */}
          <Dialog open={isAddEmployeeDialogOpen} onOpenChange={setIsAddEmployeeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>Create a new employee profile and login.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">First Name *</Label>
                  <Input id="name" value={newEmployee.first_name} onChange={(e) => setNewEmployee({ ...newEmployee, first_name: e.target.value })} disabled={isSubmittingEmployee}/>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Last Name *</Label>
                  <Input id="name" value={newEmployee.last_name} onChange={(e) => setNewEmployee({ ...newEmployee, last_name: e.target.value })} disabled={isSubmittingEmployee}/>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="employee_id">Employee ID</Label>
                  <Input id="employee_id" value={newEmployee.employee_id} onChange={(e) => setNewEmployee({ ...newEmployee, employee_id: e.target.value })} disabled={isSubmittingEmployee}/>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} disabled={isSubmittingEmployee}/>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input id="password" type="password" value={newEmployee.password} onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })} placeholder="Min. 6 characters" disabled={isSubmittingEmployee}/>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  {/* Consider using a Select component if roles are predefined */}
                  <Input id="role" value={newEmployee.role} onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })} disabled={isSubmittingEmployee}/>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="active" checked={newEmployee.is_active} onCheckedChange={(checked) => setNewEmployee({ ...newEmployee, is_active: checked })} disabled={isSubmittingEmployee}/>
                  <Label htmlFor="active">Active (Profile)</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddEmployeeDialogOpen(false)} disabled={isSubmittingEmployee}>Cancel</Button>
                <Button variant="default" onClick={handleAddEmployee} disabled={isSubmittingEmployee}>
                   {isSubmittingEmployee ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                   {isSubmittingEmployee ? 'Adding...' : 'Add Employee'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Employee Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingEmployees ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></TableCell></TableRow>
              ) : !filteredEmployees.length ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">No employees found.</TableCell></TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium truncate max-w-[100px]" title={employee.employee_id}>{employee.employee_id || 'N/A'}</TableCell>
                    <TableCell>{employee.first_name} {employee.last_name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch id={`active-emp-${employee.id}`} checked={employee.is_active} onCheckedChange={() => handleToggleEmployeeActive(employee.id, employee.is_active, employee.first_name ?? '', employee.last_name || employee.email || employee.id)} />
                        <Label htmlFor={`active-emp-${employee.id}`} className="text-sm">{employee.is_active ? "Active" : "Inactive"}</Label>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        {/* Edit Employee Dialog */}
                        <Dialog
                          open={isEditEmployeeDialogOpen && editingEmployee?.id === employee.id}
                          onOpenChange={(isOpen) => {
                              if (!isOpen) setEditingEmployee(null);
                              setIsEditEmployeeDialogOpen(isOpen);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => { setEditingEmployee(employee); setIsEditEmployeeDialogOpen(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          {editingEmployee && editingEmployee.id === employee.id && (
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Employee</DialogTitle>
                                <DialogDescription>Update employee profile information.</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2"><Label htmlFor="edit-id">Auth ID</Label><Input id="edit-id" value={editingEmployee.id} disabled /></div>
                                <div className="grid gap-2"><Label htmlFor="edit-first-name">First Name</Label><Input id="edit-first-name" value={editingEmployee.first_name ?? ''} onChange={(e) => setEditingEmployee({ ...editingEmployee, first_name: e.target.value })} disabled={isSubmittingEmployee}/></div>
                                <div className="grid gap-2"><Label htmlFor="edit-last-name">Last Name</Label><Input id="edit-last-name" value={editingEmployee.last_name ?? ''} onChange={(e) => setEditingEmployee({ ...editingEmployee, last_name: e.target.value })} disabled={isSubmittingEmployee}/></div>
                                <div className="grid gap-2"><Label htmlFor="edit-employee-id">Employee ID</Label><Input id="edit-employee-id" value={editingEmployee.employee_id ?? ''} onChange={(e) => setEditingEmployee({ ...editingEmployee, employee_id: e.target.value })} disabled={isSubmittingEmployee}/></div>
                                <div className="grid gap-2"><Label htmlFor="edit-email">Email (Read-only)</Label><Input id="edit-email" type="email" value={editingEmployee.email ?? ''} disabled title="Email cannot be changed here."/></div>
                                <div className="grid gap-2"><Label htmlFor="edit-role">Role</Label><Input id="edit-role" value={editingEmployee.role ?? ''} onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })} disabled={isSubmittingEmployee}/></div>
                                <div className="flex items-center space-x-2"><Switch id="edit-active" checked={editingEmployee.is_active} onCheckedChange={(checked) => setEditingEmployee({ ...editingEmployee, is_active: checked })} disabled={isSubmittingEmployee}/><Label htmlFor="edit-active">Active (Profile)</Label></div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditEmployeeDialogOpen(false)} disabled={isSubmittingEmployee}>Cancel</Button>
                                <Button onClick={handleEditEmployee} disabled={isSubmittingEmployee}>
                                  {isSubmittingEmployee ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                  {isSubmittingEmployee ? 'Saving...' : 'Save Changes'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          )}
                        </Dialog>
                        {/* Deactivate Employee Button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteEmployee(employee.id)} className="text-destructive hover:text-destructive" disabled={isSubmittingEmployee || !employee.is_active} title={employee.is_active ? "Deactivate Employee Profile" : "Employee Profile is Inactive"}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Deactivate Employee</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to deactivate {pendingDeleteEmployee?.first_name} {pendingDeleteEmployee?.last_name}? This will prevent them from logging in.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setPendingDeleteEmployee(null)}>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={confirmDeleteEmployee} disabled={isSubmittingEmployee}>Deactivate</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </AccordionContent>
      <AlertDialog open={!!pendingToggleEmployee} onOpenChange={(open) => { if (!open) setPendingToggleEmployee(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingToggleEmployee?.currentStatus ? 'Deactivate' : 'Activate'} Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {pendingToggleEmployee?.currentStatus ? 'deactivate' : 'activate'} {pendingToggleEmployee?.first_name} {pendingDeleteEmployee?.last_name}? This action can be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingToggleEmployee(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleEmployeeActive} disabled={isSubmittingEmployee}>
              {pendingToggleEmployee?.currentStatus ? 'Deactivate' : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AccordionItem>
  )
}
