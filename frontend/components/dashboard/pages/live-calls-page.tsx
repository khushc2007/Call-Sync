"use client"

import { useState } from "react"
import { Phone, Clock, MessageSquare, Target, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockActiveCalls, mockLiveCalls, type ActiveCall } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function ActiveCallCard({ call, isSelected, onClick }: { call: ActiveCall; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-2xl border text-left transition-all duration-200",
        isSelected
          ? "bg-red-500/10 border-red-500/30 glow-red-sm"
          : "bg-white/5 border-white/10 hover:border-white/20"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <Phone className="w-4 h-4 text-green-400" />
          </div>
          <span className="font-medium text-white">{call.callerPhone}</span>
        </div>
        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse" />
          Active
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Clock className="w-4 h-4 text-white/40" />
          <span>Duration: {call.duration}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Target className="w-4 h-4 text-white/40" />
          <span>{call.currentStep}</span>
        </div>
        <p className="text-sm text-white/50 italic truncate">
          &ldquo;{call.transcript?.slice(0, 60)}...&rdquo;
        </p>
      </div>
    </button>
  )
}

function TranscriptView({ call }: { call: ActiveCall }) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">{call.callerPhone}</h3>
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse" />
            Live
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-white/60">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {call.duration}
          </span>
          <span className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            {call.intent?.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Slots collected */}
      {call.slots && call.slots.length > 0 && (
        <div className="p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-white/40" />
            <span className="text-sm font-medium text-white/70">Collected Information</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {call.slots.map((slot, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-callsync-purple/20 border-callsync-purple/30 text-white"
              >
                <span className="text-white/60 mr-1">{slot.label}:</span>
                {slot.value}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Live transcript */}
      <ScrollArea className="flex-1 p-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-white/40" />
          <span className="text-sm font-medium text-white/70">Live Transcript</span>
        </div>
        <div className="space-y-3">
          {call.transcript?.split("...").filter(Boolean).map((line, index) => (
            <div
              key={index}
              className={cn(
                "p-3 rounded-xl max-w-[85%]",
                index % 2 === 0
                  ? "bg-white/5 border border-white/10"
                  : "bg-red-500/10 border border-red-500/20 ml-auto"
              )}
            >
              <p className="text-sm text-white/70">
                {index % 2 === 0 ? "Caller: " : "AI: "}
                {line.trim()}
              </p>
            </div>
          ))}
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Listening...
          </div>
        </div>
      </ScrollArea>

      {/* Current step indicator */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Current Step</span>
          <Badge className="bg-yellow-500/20 text-yellow-400 border-0">
            {call.currentStep}
          </Badge>
        </div>
      </div>
    </div>
  )
}

function EmptyTranscriptView() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Phone className="w-8 h-8 text-white/20" />
      </div>
      <h3 className="text-lg font-medium text-white/70 mb-2">Select a Call</h3>
      <p className="text-sm text-white/40 max-w-xs">
        Click on an active call from the list to view the live transcript and collected information
      </p>
    </div>
  )
}

export function LiveCallsPage() {
  const [selectedCallId, setSelectedCallId] = useState<string | null>(
    mockActiveCalls.length > 0 ? mockActiveCalls[0].id : null
  )

  const selectedCall = mockActiveCalls.find((call) => call.id === selectedCallId)
  const hasActiveCalls = mockActiveCalls.length > 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
      {/* Active Calls List */}
      <div className="glass-card flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Active Calls</h3>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
              {mockActiveCalls.length} Active
            </Badge>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          {hasActiveCalls ? (
            <div className="space-y-3">
              {mockActiveCalls.map((call) => (
                <ActiveCallCard
                  key={call.id}
                  call={call}
                  isSelected={selectedCallId === call.id}
                  onClick={() => setSelectedCallId(call.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Phone className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-white/40">No active calls right now</p>
              <p className="text-sm text-white/30 mt-1">Calls will appear here in real time</p>
            </div>
          )}
        </ScrollArea>

        {/* Recent completed calls */}
        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">Recent Completed</p>
          <div className="space-y-2">
            {mockLiveCalls.slice(0, 3).map((call) => (
              <div key={call.id} className="flex items-center justify-between text-sm">
                <span className="text-white/70">{call.callerPhone}</span>
                <span className="text-white/40">{call.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transcript View */}
      <div className="glass-card overflow-hidden">
        {selectedCall ? (
          <TranscriptView call={selectedCall} />
        ) : (
          <EmptyTranscriptView />
        )}
      </div>
    </div>
  )
}
