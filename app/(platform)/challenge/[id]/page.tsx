"use client";

import { useParams } from "next/navigation";
import { useChallengeStore } from "@/store/challengeStore";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";
import { ChallengeLayout } from "@/components/challenge/ChallengeLayout";
import { useEffect } from "react";

export default function ChallengePage() {
    const params = useParams();
    const questionId = params?.id as string;
    const { currentQuestion } = useChallengeStore();

    useEffect(() => {
        // Redundancy check if URL and store don't match
        if (currentQuestion && currentQuestion.questionId !== questionId) {
            window.location.href = "/dashboard";
        }
    }, [currentQuestion, questionId]);

    return (
        <ChallengeLayout>
            {currentQuestion && <WorkspaceLayout question={currentQuestion} />}
        </ChallengeLayout>
    );
}

