-- CreateTable
CREATE TABLE "tasks" (
    "user_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "content" VARCHAR(1000) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("user_id","task_id")
);
