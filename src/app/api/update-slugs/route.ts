import { NextResponse } from 'next/server';
import { updateAllArticlesWithSlugs, checkSlugsStatus, improveSpecificSlug } from '../../utils/fetchNews';

export async function POST(request: Request) {
  try {
    console.log("DEBUG: API route /api/update-slugs POST called");
    
    const body = await request.json();
    const { action, articleId } = body;
    
    // إذا تم تحديد action محدد
    if (action === 'check-status') {
      const result = await checkSlugsStatus();
      return NextResponse.json(result);
    }
    
    if (action === 'improve-specific' && articleId) {
      const result = await improveSpecificSlug(articleId);
      return NextResponse.json(result);
    }
    
    // الإجراء الافتراضي: تحديث جميع slugs
    const result = await updateAllArticlesWithSlugs();
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: result.message,
        details: result.details
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in update-slugs API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process request' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    console.log("DEBUG: API route /api/update-slugs GET called");
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const articleId = searchParams.get('articleId');
    
    // إذا تم تحديد action محدد
    if (action === 'check-status') {
      const result = await checkSlugsStatus();
      return NextResponse.json(result);
    }
    
    if (action === 'improve-specific' && articleId) {
      const result = await improveSpecificSlug(articleId);
      return NextResponse.json(result);
    }
    
    // الإجراء الافتراضي: تحديث جميع slugs
    const result = await updateAllArticlesWithSlugs();
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: result.message,
        details: result.details
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating articles with slugs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update articles with slugs' 
      },
      { status: 500 }
    );
  }
} 