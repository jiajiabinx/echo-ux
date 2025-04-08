"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type UserInfo = {
  name: string
  birth_date: string
  birth_location: string
  primaryResidence: string
  currentResidence: string
  highestDegree: string
  school: string
  occupation: string
  hobby: string
  parental_income: number | null
  familyStatus: string
  race: string
  religion: string
  user_id?: string // Add user_id field
}

type UserContextType = {
  userInfo: UserInfo
  updateUserInfo: (info: Partial<UserInfo>) => void
}

const initialUserInfo: UserInfo = {
  name: "",
  birth_date: "",
  birth_location: "",
  primaryResidence: "",
  currentResidence: "",
  highestDegree: "",
  school: "",
  occupation: "",
  hobby: "",
  parental_income: null,
  familyStatus: "",
  race: "",
  religion: "",
  user_id: undefined,
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo>(initialUserInfo)

  const updateUserInfo = (info: Partial<UserInfo>) => {
    setUserInfo((prev) => ({ ...prev, ...info }))
  }

  return <UserContext.Provider value={{ userInfo, updateUserInfo }}>{children}</UserContext.Provider>
}

export function useUserInfo() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUserInfo must be used within a UserProvider")
  }
  return context
}

