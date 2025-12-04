import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useMachines } from "@/hooks/useMachines";

const AddMachineDialog = () => {
  const [open, setOpen] = useState(false);
  const { addMachine } = useMachines();
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    status: "healthy" as const,
    health_score: 100,
    temperature: 25,
    vibration: 0.5,
    current_load: 50,
    components: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMachine(formData);
    setOpen(false);
    setFormData({
      name: "",
      location: "",
      status: "healthy",
      health_score: 100,
      temperature: 25,
      vibration: 0.5,
      current_load: 50,
      components: [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Machine
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Machine</DialogTitle>
            <DialogDescription>Enter the details for the new machine to add to your factory.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Machine Name</Label>
              <Input
                id="name"
                placeholder="CNC Milling Machine"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Building A, Floor 2"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="temperature">Temperature (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vibration">Vibration (mm/s)</Label>
                <Input
                  id="vibration"
                  type="number"
                  step="0.1"
                  value={formData.vibration}
                  onChange={(e) => setFormData({ ...formData, vibration: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="current_load">Current Load (%)</Label>
              <Input
                id="current_load"
                type="number"
                min="0"
                max="100"
                value={formData.current_load}
                onChange={(e) => setFormData({ ...formData, current_load: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Machine</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMachineDialog;
