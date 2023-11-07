#functions
# function to display user text when button is clicked
def clicked():
    checkInputs()
    scriptText=open("script.txt", "r", encoding='UTF8').read()
    createApplications(scriptText, "scriptres.txt")
    

def createApplications(applicationsText, filename):
    applicationsText=applicationsText.replace("(username)", credentialsEntry.get())
    applicationsText=applicationsText.replace("(sluid)", idEntry.get())
    applicationsText=applicationsText.replace("(effectiveDate)", EffectiveDateEntry.get())
    applicationsText=applicationsText.replace("(termStatus)", terminationEntry.get())
    applicationsText=applicationsText.replace("(supervisorEmail)", supervisorEntry.get())

    if(terminationEntry.get()=="Involuntary"):
        applicationsText=applicationsText.replace("Employee Termination", "Employee Involuntary Termination")

    f2 = open(filename, "w", encoding='UTF8')
    f2.write(applicationsText)


def checkInputs():
    if ("." not in credentialsEntry.get()):
        messagebox.showinfo("Incorrect Credentials", "Credentials must follow the format name.lastname")
    elif (idEntry.get()==""):
        messagebox.showinfo("Incorrect ID", "ID field is required")
    elif(EffectiveDateEntry.get()==""):
        messagebox.showinfo("Incorrect Effective Date", "Effective Date field is required")
    elif(terminationEntry.get()!="Voluntary" and terminationEntry.get()!="Involuntary" ):
        messagebox.showinfo("Incorrect Termination Status", "Term status have to be a value")
        

# USER INTERFACE
from tkinter import *
from tkinter import messagebox 

# create root window
root = Tk()

# root window title and dimension
root.title("Termination Sript Generator")
# Set geometry(widthxheight)
root.geometry('400x200')

# adding a label to the root window
labelCredentials = Label(root, text = "Credentials")
labelCredentials.grid()
# adding Entry Field
credentialsEntry = Entry(root, width=40)
credentialsEntry.grid(column =1, row =0)

# adding a label to the root window
labelEffectiveDate = Label(root, text = "Effective Date")
labelEffectiveDate.grid()
# adding Entry Field
EffectiveDateEntry = Entry(root, width=40)
EffectiveDateEntry.grid(column =1, row =1)

# adding a label to the root window
labelID= Label(root, text = "Employee ID")
labelID.grid()
# adding Entry Field
idEntry = Entry(root, width=40)
idEntry.grid(column =1, row =2)

# adding a label to the root window
labelTermination = Label(root, text = "Termination Status")
labelTermination.grid()
# adding Entry Field
terminationEntry = Entry(root, width=40)
terminationEntry.grid(column =1, row =3)

# adding a label to the root window
labelSupervisor = Label(root, text = "Supervisor Email")
labelSupervisor.grid()
# adding Entry Field
supervisorEntry = Entry(root, width=40)
supervisorEntry.grid(column =1, row =4, columnspan=3)

# button widget with red color text inside
btn = Button(root, text = "Generate" ,
			fg = "red", command=clicked)
# Set Button Grid
btn.grid(column=1, row=6)

#DefineVariables
terminationStatus=terminationEntry.get()
supervisorEmail=supervisorEntry.get()
# Execute Tkinter
root.mainloop()
