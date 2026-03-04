"use client";

import { ChallengeLayout } from "@/components/challenge/ChallengeLayout";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";
import { useChallengeStore } from "@/store/challengeStore";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ChallengePage() {
    const params = useParams();
    const router = useRouter();
    const questionId = params?.id as string;
    const { currentQuestion, isGenerating } = useChallengeStore();

    useEffect(() => {
        // If a new question has been generated (different ID from URL), navigate
        // to the new question page instead of sending the user to /dashboard.
        // Skip this check while generation is still in-flight.
        if (!isGenerating && currentQuestion && currentQuestion.questionId !== questionId) {
            router.replace(`/challenge/${currentQuestion.questionId}`);
        }
    }, [currentQuestion, questionId, isGenerating, router]);

    return (
        <ChallengeLayout>
            {currentQuestion && <WorkspaceLayout question={currentQuestion} />}
        </ChallengeLayout>
    );
}
